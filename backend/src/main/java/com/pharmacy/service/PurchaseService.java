package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.PurchaseItemRequest;
import com.pharmacy.dto.PurchaseItemResponse;
import com.pharmacy.dto.PurchaseRequest;
import com.pharmacy.dto.PurchaseResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.Purchase;
import com.pharmacy.entity.PurchaseItem;
import com.pharmacy.entity.PurchaseStatus;
import com.pharmacy.entity.RecordStatus;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.entity.Supplier;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ConflictException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.PurchaseItemRepository;
import com.pharmacy.repository.PurchaseRepository;
import com.pharmacy.repository.SupplierRepository;

@Service
@Transactional
public class PurchaseService {

	private final PurchaseRepository purchaseRepository;
	private final PurchaseItemRepository purchaseItemRepository;
	private final SupplierRepository supplierRepository;
	private final MedicineRepository medicineRepository;
	private final BatchRepository batchRepository;
	private final StockService stockService;

	public PurchaseService(PurchaseRepository purchaseRepository, PurchaseItemRepository purchaseItemRepository,
			SupplierRepository supplierRepository, MedicineRepository medicineRepository,
			BatchRepository batchRepository, StockService stockService) {

		this.purchaseRepository = purchaseRepository;
		this.purchaseItemRepository = purchaseItemRepository;
		this.supplierRepository = supplierRepository;
		this.medicineRepository = medicineRepository;
		this.batchRepository = batchRepository;
		this.stockService = stockService;
	}

	@Transactional(readOnly = true)
	public List<PurchaseResponse> searchPurchases(Long supplierId, PurchaseStatus status) {

		List<Purchase> purchases;

		if (supplierId != null && status != null) {

			purchases = purchaseRepository.findBySupplierIdAndStatusOrderByPurchaseDateDesc(supplierId, status);

		} else if (supplierId != null) {

			purchases = purchaseRepository.findBySupplierIdOrderByPurchaseDateDesc(supplierId);

		} else if (status != null) {

			purchases = purchaseRepository.findByStatusOrderByPurchaseDateDesc(status);

		} else {

			purchases = purchaseRepository.findAllByOrderByPurchaseDateDesc();
		}

		return purchases.stream().map(this::mapToResponse).toList();
	}

	public PurchaseResponse createPurchase(PurchaseRequest request) {

		Supplier supplier = supplierRepository.findById(request.supplierId()).orElseThrow(
				() -> new ResourceNotFoundException("Supplier not found with id: " + request.supplierId()));

		if (supplier.getStatus() == RecordStatus.INACTIVE) {
			throw new BadRequestException("Cannot create purchase for an inactive supplier");
		}

		if (request.purchaseDate().isAfter(LocalDate.now())) {
			throw new BadRequestException("Purchase date cannot be in the future");
		}

		String invoiceNumber = generateInvoiceNumber();

		if (purchaseRepository.existsByInvoiceNumber(invoiceNumber)) {
			throw new ConflictException("Purchase invoice number already exists");
		}

		Purchase purchase = new Purchase();

		purchase.setSupplier(supplier);
		purchase.setInvoiceNumber(invoiceNumber);
		purchase.setPurchaseDate(request.purchaseDate());
		purchase.setStatus(PurchaseStatus.RECEIVED);
		purchase.setNotes(normalizeText(request.notes()));
		purchase.setTotalAmount(BigDecimal.ZERO);

		purchase = purchaseRepository.save(purchase);

		BigDecimal totalAmount = BigDecimal.ZERO;

		for (PurchaseItemRequest itemRequest : request.items()) {

			Medicine medicine = medicineRepository.findById(itemRequest.medicineId()).orElseThrow(
					() -> new ResourceNotFoundException("Medicine not found with id: " + itemRequest.medicineId()));

			if (medicine.getStatus() == RecordStatus.INACTIVE) {
				throw new BadRequestException("Cannot purchase inactive medicine: " + medicine.getName());
			}

			validateItem(itemRequest);

			Batch batch = findOrCreateBatch(medicine, itemRequest);

			stockService.addStock(batch, itemRequest.quantity(), StockTransactionType.PURCHASE, invoiceNumber,
					"Purchase received");

			BigDecimal lineTotal = itemRequest.purchasePrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));

			PurchaseItem purchaseItem = new PurchaseItem();

			purchaseItem.setPurchase(purchase);
			purchaseItem.setMedicine(medicine);
			purchaseItem.setBatch(batch);
			purchaseItem.setQuantity(itemRequest.quantity());
			purchaseItem.setPurchasePrice(itemRequest.purchasePrice());
			purchaseItem.setSellingPrice(itemRequest.sellingPrice());
			purchaseItem.setMrp(itemRequest.mrp());
			purchaseItem.setLineTotal(lineTotal);

			purchaseItemRepository.save(purchaseItem);

			totalAmount = totalAmount.add(lineTotal);
		}

		purchase.setTotalAmount(totalAmount);

		purchase = purchaseRepository.save(purchase);

		return mapToResponse(purchase);
	}

	@Transactional(readOnly = true)
	public List<PurchaseResponse> getAllPurchases() {

		return purchaseRepository.findAllByOrderByPurchaseDateDesc().stream().map(this::mapToResponse).toList();
	}

	@Transactional(readOnly = true)
	public PurchaseResponse getPurchaseById(Long id) {

		Purchase purchase = purchaseRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

		return mapToResponse(purchase);
	}
	
	@Transactional(readOnly = true)
	public List<PurchaseResponse> getPurchasesBySupplierId(Long supplierId) {

	    return purchaseRepository
	            .findBySupplierIdOrderByPurchaseDateDesc(supplierId)
	            .stream()
	            .map(this::mapToResponse)
	            .toList();
	}

	private Batch findOrCreateBatch(Medicine medicine, PurchaseItemRequest request) {

		String batchNumber = request.batchNumber().trim();

		Batch batch = batchRepository.findByMedicineAndBatchNumber(medicine, batchNumber).orElse(null);

		if (batch == null) {

			batch = new Batch();

			batch.setMedicine(medicine);
			batch.setBatchNumber(batchNumber);
			batch.setManufacturingDate(request.manufacturingDate());
			batch.setExpiryDate(request.expiryDate());
			batch.setQuantity(0);
			batch.setPurchasePrice(request.purchasePrice());
			batch.setSellingPrice(request.sellingPrice());
			batch.setMrp(request.mrp());

			return batchRepository.save(batch);
		}

		if (!batch.getExpiryDate().equals(request.expiryDate())) {
			throw new ConflictException("Batch already exists with a different expiry date");
		}

		batch.setPurchasePrice(request.purchasePrice());
		batch.setSellingPrice(request.sellingPrice());
		batch.setMrp(request.mrp());

		return batchRepository.save(batch);
	}

	private void validateItem(PurchaseItemRequest request) {

		LocalDate today = LocalDate.now();

		if (request.expiryDate().isBefore(today)) {
			throw new BadRequestException("Expiry date cannot be in the past");
		}

		if (request.manufacturingDate() != null && request.expiryDate().isBefore(request.manufacturingDate())) {

			throw new BadRequestException("Expiry date cannot be before manufacturing date");
		}

		if (request.mrp().compareTo(request.sellingPrice()) < 0) {
			throw new BadRequestException("MRP cannot be less than selling price");
		}
	}

	private String generateInvoiceNumber() {

		return "PUR-" + System.currentTimeMillis();
	}

	private PurchaseResponse mapToResponse(Purchase purchase) {

		List<PurchaseItem> items = purchaseItemRepository.findByPurchaseIdOrderByIdAsc(purchase.getId());

		List<PurchaseItemResponse> itemResponses = new ArrayList<>();

		for (PurchaseItem item : items) {

			Batch batch = item.getBatch();
			Medicine medicine = item.getMedicine();

			itemResponses.add(new PurchaseItemResponse(item.getId(), medicine.getId(), medicine.getName(),
					batch.getId(), batch.getBatchNumber(), batch.getManufacturingDate(), batch.getExpiryDate(),
					item.getQuantity(), item.getPurchasePrice(), item.getSellingPrice(), item.getMrp(),
					item.getLineTotal()));
		}

		return new PurchaseResponse(purchase.getId(), purchase.getSupplier().getId(), purchase.getSupplier().getName(),
				purchase.getInvoiceNumber(), purchase.getPurchaseDate(), purchase.getTotalAmount(),
				purchase.getStatus(), purchase.getNotes(), itemResponses, purchase.getCreatedAt(),
				purchase.getUpdatedAt());
	}

	private String normalizeText(String value) {

		if (value == null || value.isBlank()) {
			return null;
		}

		return value.trim();
	}
	

}