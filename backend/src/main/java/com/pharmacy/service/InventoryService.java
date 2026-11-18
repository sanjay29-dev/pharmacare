package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.BatchResponse;
import com.pharmacy.dto.InventoryResponse;
import com.pharmacy.dto.MedicineDetailsResponse;
import com.pharmacy.dto.MedicineResponse;
import com.pharmacy.dto.StockStatusResponse;
import com.pharmacy.dto.StockTransactionResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.RecordStatus;
import com.pharmacy.entity.StockStatus;
import com.pharmacy.entity.StockTransaction;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.StockTransactionRepository;

@Service
@Transactional(readOnly = true)
public class InventoryService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final StockStatusCalculator stockStatusCalculator;
    private final MedicineService medicineService;

    public InventoryService(
            MedicineRepository medicineRepository,
            BatchRepository batchRepository,
            StockTransactionRepository stockTransactionRepository,
            StockStatusCalculator stockStatusCalculator,
            MedicineService medicineService) {

        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.stockStatusCalculator = stockStatusCalculator;
        this.medicineService = medicineService;
    }

    public List<InventoryResponse> getInventory() {

        return medicineRepository
                .findByStatus(RecordStatus.ACTIVE)
                .stream()
                .map(this::mapInventory)
                .toList();
    }

    public List<InventoryResponse> getLowStock() {

        return getInventory()
                .stream()
                .filter(item -> item.status() == StockStatus.LOW_STOCK)
                .toList();
    }

    public List<InventoryResponse> getOutOfStock() {

        return getInventory()
                .stream()
                .filter(item -> item.status() == StockStatus.OUT_OF_STOCK
                        || item.status() == StockStatus.EXPIRED)
                .toList();
    }

    public List<StockTransactionResponse> getTransactions(
            Long medicineId,
            StockTransactionType type,
            LocalDate from,
            LocalDate to) {

        LocalDateTime fromDate = from == null
                ? null
                : from.atStartOfDay();

        LocalDateTime toDate = to == null
                ? null
                : to.plusDays(1).atStartOfDay().minusNanos(1);

        return stockTransactionRepository
                .searchTransactions(
                        medicineId,
                        type,
                        fromDate,
                        toDate)
                .stream()
                .map(this::mapTransaction)
                .toList();
    }

    public MedicineDetailsResponse getMedicineDetails(Long medicineId) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Medicine not found with id: " + medicineId
                ));

        List<Batch> batches =
                batchRepository.findByMedicineIdOrderByExpiryDateAscIdAsc(
                        medicineId
                );

        StockStatusResponse stockStatus =
                stockStatusCalculator.calculate(
                        batches,
                        medicine.getReorderLevel()
                );

        MedicineResponse medicineResponse =
                medicineService.getMedicineById(medicineId);

        List<BatchResponse> batchResponses =
                batches.stream()
                        .map(this::mapBatch)
                        .toList();

        List<StockTransactionResponse> transactions =
                stockTransactionRepository
                        .findByMedicineIdOrderByTransactionDateDesc(
                                medicineId)
                        .stream()
                        .map(this::mapTransaction)
                        .toList();

        return new MedicineDetailsResponse(
                medicineResponse,
                stockStatus,
                batchResponses,
                transactions
        );
    }

    private InventoryResponse mapInventory(Medicine medicine) {

        List<Batch> batches =
                batchRepository.findByMedicineIdOrderByExpiryDateAscIdAsc(
                        medicine.getId()
                );

        StockStatusResponse status =
                stockStatusCalculator.calculate(
                        batches,
                        medicine.getReorderLevel()
                );

        BigDecimal stockValue = batches.stream()
                .filter(batch ->
                        batch.getQuantity() > 0
                                && !batch.getExpiryDate()
                                        .isBefore(LocalDate.now()))
                .map(batch ->
                        batch.getPurchasePrice()
                                .multiply(
                                        BigDecimal.valueOf(
                                                batch.getQuantity()
                                        )
                                )
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new InventoryResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getGenericName(),
                medicine.getCategory().getName(),
                medicine.getManufacturer(),
                medicine.getReorderLevel(),
                status.totalQty(),
                status.availableQty(),
                status.expiredQty(),
                status.earliestExpiry(),
                stockValue,
                status.status(),
                status.hasExpiredBatch(),
                status.hasExpiringSoonBatch()
        );
    }

    private BatchResponse mapBatch(Batch batch) {

        return new BatchResponse(
                batch.getId(),
                batch.getMedicine().getId(),
                batch.getMedicine().getName(),
                batch.getBatchNumber(),
                batch.getManufacturingDate(),
                batch.getExpiryDate(),
                batch.getQuantity(),
                batch.getPurchasePrice(),
                batch.getSellingPrice(),
                batch.getMrp(),
                batch.getCreatedAt(),
                batch.getUpdatedAt()
        );
    }

    private StockTransactionResponse mapTransaction(
            StockTransaction transaction) {

        return new StockTransactionResponse(
                transaction.getId(),
                transaction.getMedicine().getId(),
                transaction.getMedicine().getName(),
                transaction.getBatch().getId(),
                transaction.getBatch().getBatchNumber(),
                transaction.getType(),
                transaction.getQuantityChange(),
                transaction.getBalanceAfter(),
                transaction.getReference(),
                transaction.getNote(),
                transaction.getCreatedBy(),
                transaction.getTransactionDate()
        );
    }
}