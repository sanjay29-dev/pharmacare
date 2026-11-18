
package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.SaleItemRequest;
import com.pharmacy.dto.SaleItemResponse;
import com.pharmacy.dto.SaleRequest;
import com.pharmacy.dto.SaleResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.RecordStatus;
import com.pharmacy.entity.Sale;
import com.pharmacy.entity.SaleItem;
import com.pharmacy.entity.SaleStatus;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.SaleItemRepository;
import com.pharmacy.repository.SaleRepository;
import com.pharmacy.repository.SalesInvoiceSettingsRepository;
import com.pharmacy.util.FefoAllocator;
import com.pharmacy.util.FefoAllocator.Allocation;

@Service
@Transactional
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final StockService stockService;
    private final FefoAllocator fefoAllocator;
    private final SalesInvoiceSettingsRepository salesInvoiceSettingsRepository;

    public SaleService(
            SaleRepository saleRepository,
            SaleItemRepository saleItemRepository,
            MedicineRepository medicineRepository,
            BatchRepository batchRepository,
            StockService stockService,
            SalesInvoiceSettingsRepository salesInvoiceSettingsRepository) {

        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.stockService = stockService;
        this.salesInvoiceSettingsRepository = salesInvoiceSettingsRepository;
        this.fefoAllocator = new FefoAllocator();
    }

    public SaleResponse createSale(SaleRequest request) {

        if (request == null) {
            throw new BadRequestException("Sale request is required.");
        }

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException(
                    "At least one sale item is required.");
        }

        BigDecimal discount = request.discount() == null
                ? BigDecimal.ZERO
                : request.discount();

        BigDecimal tax = request.tax() == null
                ? BigDecimal.ZERO
                : request.tax();

        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "Discount cannot be negative.");
        }

        if (tax.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "Tax cannot be negative.");
        }

        Map<Long, Integer> mergedItems = mergeItems(request.items());

        Sale sale = new Sale();

        sale.setCustomerName(normalizeCustomerName(
                request.customerName()));

        sale.setSaleDate(LocalDateTime.now());
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setStatus(SaleStatus.COMPLETED);
        sale.setSubtotal(BigDecimal.ZERO);
        sale.setTotalAmount(BigDecimal.ZERO);

        /*
         * Save first so the database generates the sale ID.
         * The invoice number is created from this ID.
         */
        sale = saleRepository.save(sale);

        // Load the invoice prefix from Sales & Invoice Settings.
        String invoicePrefix = salesInvoiceSettingsRepository
                .findById(1L)
                .map(settings -> settings.getInvoicePrefix())
                .filter(prefix -> prefix != null && !prefix.isBlank())
                .orElse("INV")
                .trim();

        sale.setInvoiceNumber(
                String.format("%s-%06d", invoicePrefix, sale.getId()));

        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : mergedItems.entrySet()) {

            Long medicineId = entry.getKey();
            int requestedQuantity = entry.getValue();

            Medicine medicine = medicineRepository.findById(medicineId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Medicine not found with id: "
                                    + medicineId));

            if (medicine.getStatus() == RecordStatus.INACTIVE) {
                throw new BadRequestException(
                        "Medicine is inactive: "
                                + medicine.getName());
            }

            List<Batch> usableBatches =
                    batchRepository.findUsableBatchesForSale(
                            medicineId,
                            LocalDate.now());

            List<Allocation> allocations =
                    fefoAllocator.allocate(
                            usableBatches,
                            requestedQuantity);

            for (Allocation allocation : allocations) {

                Batch batch = allocation.batch();
                int quantity = allocation.quantity();

                stockService.reduceStock(
                        batch,
                        quantity,
                        StockTransactionType.SALE,
                        sale.getInvoiceNumber(),
                        "Sale completed");

                BigDecimal sellingPrice =
                        batch.getSellingPrice();

                BigDecimal lineTotal =
                        sellingPrice.multiply(
                                BigDecimal.valueOf(quantity));

                SaleItem saleItem = new SaleItem();

                saleItem.setSale(sale);
                saleItem.setMedicine(medicine);
                saleItem.setBatch(batch);
                saleItem.setQuantity(quantity);
                saleItem.setSellingPrice(sellingPrice);
                saleItem.setLineTotal(lineTotal);

                saleItemRepository.save(saleItem);

                subtotal = subtotal.add(lineTotal);
            }
        }

        if (discount.compareTo(subtotal) > 0) {
            throw new BadRequestException(
                    "Discount cannot be greater than subtotal.");
        }

        BigDecimal total = subtotal
                .subtract(discount)
                .add(tax);

        sale.setSubtotal(subtotal);
        sale.setTotalAmount(total);

        sale = saleRepository.save(sale);

        return mapToResponse(sale);
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {

        return saleRepository
                .findAllByOrderBySaleDateDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sale not found with id: " + id));

        return mapToResponse(sale);
    }

    @Transactional(readOnly = true)
    public List<SaleResponse> searchSales(
            LocalDateTime from,
            LocalDateTime to,
            SaleStatus status) {

        List<Sale> sales;

        if (from != null && to != null) {

            sales = saleRepository
                    .findBySaleDateBetweenOrderBySaleDateDesc(
                            from,
                            to);

        } else if (status != null) {

            sales = saleRepository
                    .findByStatusOrderBySaleDateDesc(status);

        } else {

            sales = saleRepository
                    .findAllByOrderBySaleDateDesc();
        }

        return sales.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Map<Long, Integer> mergeItems(
            List<SaleItemRequest> items) {

        Map<Long, Integer> mergedItems =
                new LinkedHashMap<>();

        for (SaleItemRequest item : items) {

            if (item == null) {
                throw new BadRequestException(
                        "Sale item cannot be null.");
            }

            if (item.medicineId() == null) {
                throw new BadRequestException(
                        "Medicine is required.");
            }

            if (item.quantity() == null
                    || item.quantity() <= 0) {

                throw new BadRequestException(
                        "Quantity must be greater than zero.");
            }

            mergedItems.merge(
                    item.medicineId(),
                    item.quantity(),
                    Integer::sum);
        }

        return mergedItems;
    }

    private String normalizeCustomerName(
            String customerName) {

        if (customerName == null
                || customerName.isBlank()) {

            return "Walk-in";
        }

        return customerName.trim();
    }

    private SaleResponse mapToResponse(Sale sale) {

        List<SaleItem> items =
                saleItemRepository
                        .findBySaleIdOrderByIdAsc(sale.getId());

        List<SaleItemResponse> itemResponses =
                new ArrayList<>();

        for (SaleItem item : items) {

            itemResponses.add(
                    new SaleItemResponse(
                            item.getId(),
                            item.getMedicine().getId(),
                            item.getMedicine().getName(),
                            item.getBatch().getId(),
                            item.getBatch().getBatchNumber(),
                            item.getQuantity(),
                            item.getSellingPrice(),
                            item.getLineTotal()
                    )
            );
        }

        return new SaleResponse(
                sale.getId(),
                sale.getInvoiceNumber(),
                sale.getCustomerName(),
                sale.getSaleDate(),
                sale.getSubtotal(),
                sale.getDiscount(),
                sale.getTax(),
                sale.getTotalAmount(),
                sale.getStatus(),
                sale.getCreatedBy(),
                itemResponses,
                sale.getCreatedAt(),
                sale.getUpdatedAt()
        );
    }
}
