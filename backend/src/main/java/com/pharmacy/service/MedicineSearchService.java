
package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.MedicineSearchResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.StockStatus;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.MedicineRepository;

@Service
@Transactional(readOnly = true)
public class MedicineSearchService {

    private final MedicineRepository medicineRepository;
    private final BatchRepository batchRepository;
    private final StockStatusCalculator stockStatusCalculator;

    public MedicineSearchService(
            MedicineRepository medicineRepository,
            BatchRepository batchRepository,
            StockStatusCalculator stockStatusCalculator) {

        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
        this.stockStatusCalculator = stockStatusCalculator;
    }

    public List<MedicineSearchResponse> search(
            String keyword,
            Long categoryId,
            String manufacturer,
            StockStatus stockStatus) {

        String normalizedKeyword =
                keyword == null ? "" : keyword.trim();

        String normalizedManufacturer =
                manufacturer == null || manufacturer.isBlank()
                        ? null
                        : manufacturer.trim();

        List<Medicine> medicines;

        if (normalizedKeyword.isBlank()) {

            medicines = medicineRepository
                    .findByStatus(com.pharmacy.entity.RecordStatus.ACTIVE)
                    .stream()
                    .filter(medicine ->
                            categoryId == null
                                    || medicine.getCategory().getId().equals(categoryId))
                    .filter(medicine ->
                            normalizedManufacturer == null
                                    || (medicine.getManufacturer() != null
                                    && medicine.getManufacturer()
                                            .toLowerCase()
                                            .contains(normalizedManufacturer.toLowerCase())))
                    .toList();

        } else {

            medicines = medicineRepository.searchActiveMedicines(
                    normalizedKeyword,
                    categoryId,
                    normalizedManufacturer
            );
        }

        return medicines.stream()
                .map(this::map)
                .filter(response ->
                        stockStatus == null
                                || response.stockStatus() == stockStatus)
                .toList();
    }

    public MedicineSearchResponse findByBarcode(String barcode) {

        String normalizedBarcode =
                barcode == null ? "" : barcode.trim();

        Medicine medicine = medicineRepository
                .findByBarcode(normalizedBarcode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with barcode: "
                                        + normalizedBarcode
                        ));

        return map(medicine);
    }

    private MedicineSearchResponse map(Medicine medicine) {

        // Fetch batches in FEFO order without acquiring write locks.
        List<Batch> batches =
                batchRepository.findByMedicineIdOrderByExpiryDateAscIdAsc(
                        medicine.getId()
                );

        var status = stockStatusCalculator.calculate(
                batches,
                medicine.getReorderLevel()
        );

        // Get selling price from the earliest usable batch.
        LocalDate today = LocalDate.now();

        BigDecimal sellingPrice = batches.stream()
                .filter(batch -> batch.getQuantity() > 0)
                .filter(batch -> batch.getExpiryDate() != null)
                .filter(batch ->
                        !batch.getExpiryDate().isBefore(today))
                .map(Batch::getSellingPrice)
                .filter(price -> price != null)
                .findFirst()
                .orElse(null);

        return new MedicineSearchResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getGenericName(),
                medicine.getCategory().getName(),
                medicine.getManufacturer(),
                medicine.getBarcode(),
                medicine.getReorderLevel(),
                status.availableQty(),
                status.totalQty(),
                status.status(),
                status.hasExpiredBatch(),
                status.hasExpiringSoonBatch(),
                sellingPrice
        );
    }
}
