
package com.pharmacy.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.BatchRequest;
import com.pharmacy.dto.BatchResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.exception.ConflictException;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.MedicineRepository;

@Service
@Transactional
public class BatchService {

	private final BatchRepository batchRepository;
	private final MedicineRepository medicineRepository;
	private final StockService stockService;

	public BatchService(BatchRepository batchRepository, MedicineRepository medicineRepository, StockService stockService) {

		this.batchRepository = batchRepository;
		this.medicineRepository = medicineRepository;
		this.stockService = stockService;
	}
	
    public void writeOff(Long batchId, String reason) {

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() ->new ResourceNotFoundException("Batch not found with id: " + batchId ));

        stockService.writeOff(batch, reason);
    }

	public BatchResponse addOpeningStock(BatchRequest request) {

		Medicine medicine = medicineRepository.findById(request.medicineId()).orElseThrow(
				() -> new ResourceNotFoundException("Medicine not found with id: " + request.medicineId()));

		if (medicine.getStatus().name().equals("INACTIVE")) {
			throw new BadRequestException("Cannot add stock for an inactive medicine.");
		}

		String batchNumber = request.batchNumber().trim();

		if (batchRepository.existsByMedicineAndBatchNumber(medicine, batchNumber)) {

			throw new ConflictException("Batch number already exists for this medicine.");
		}

		validateDates(request);

		if (request.mrp().compareTo(request.sellingPrice()) < 0) {
			throw new BadRequestException("MRP cannot be less than selling price.");
		}

		Batch batch = new Batch();

		batch.setMedicine(medicine);
		batch.setBatchNumber(batchNumber);
		batch.setManufacturingDate(request.manufacturingDate());
		batch.setExpiryDate(request.expiryDate());
		batch.setQuantity(0);
		batch.setPurchasePrice(request.purchasePrice());
		batch.setSellingPrice(request.sellingPrice());
		batch.setMrp(request.mrp());

		batch = batchRepository.save(batch);

		stockService.addStock(batch, request.quantity(), StockTransactionType.ADJUSTMENT, "OPENING STOCK",
				"Opening stock");

		return mapToResponse(batch);
	}

	@Transactional(readOnly = true)
	public List<BatchResponse> getBatchesByMedicine(Long medicineId) {

		if (!medicineRepository.existsById(medicineId)) {
			throw new ResourceNotFoundException("Medicine not found with id: " + medicineId);
		}

		return batchRepository.findByMedicineIdOrderByExpiryDateAscIdAsc(medicineId).stream().map(this::mapToResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public BatchResponse getBatchById(Long id) {

		Batch batch = batchRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));

		return mapToResponse(batch);
	}

	public void adjustStock(Long batchId, int newQuantity, String reason) {

		Batch batch = batchRepository.findById(batchId)
				.orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + batchId));

		stockService.adjustStock(batch, newQuantity, reason);
	}

	private void validateDates(BatchRequest request) {

		LocalDate today = LocalDate.now();

		if (request.expiryDate().isBefore(today)) {
			throw new BadRequestException("Expiry date cannot be in the past.");
		}

		if (request.manufacturingDate() != null && request.expiryDate().isBefore(request.manufacturingDate())) {

			throw new BadRequestException("Expiry date cannot be before manufacturing date.");
		}
	}

	private BatchResponse mapToResponse(Batch batch) {

		return new BatchResponse(batch.getId(), batch.getMedicine().getId(), batch.getMedicine().getName(),
				batch.getBatchNumber(), batch.getManufacturingDate(), batch.getExpiryDate(), batch.getQuantity(),
				batch.getPurchasePrice(), batch.getSellingPrice(), batch.getMrp(), batch.getCreatedAt(),
				batch.getUpdatedAt());

	}
}