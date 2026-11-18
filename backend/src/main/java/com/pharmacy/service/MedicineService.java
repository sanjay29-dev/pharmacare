package com.pharmacy.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.MedicineRequest;
import com.pharmacy.dto.MedicineResponse;
import com.pharmacy.entity.Category;
import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.RecordStatus;
import com.pharmacy.exception.ConflictException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CategoryRepository;
import com.pharmacy.repository.MedicineRepository;

@Service
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    public MedicineService(
            MedicineRepository medicineRepository,
            CategoryRepository categoryRepository) {

        this.medicineRepository = medicineRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {

        return medicineRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id));

        return mapToResponse(medicine);
    }

    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String name) {

        return medicineRepository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineResponse getMedicineByBarcode(String barcode) {

        Medicine medicine = medicineRepository.findByBarcode(barcode)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with barcode: " + barcode));

        return mapToResponse(medicine);
    }

    public MedicineResponse createMedicine(MedicineRequest request) {

        String barcode = normalizeBarcode(request.barcode());

        if (barcode != null && medicineRepository.existsByBarcode(barcode)) {
            throw new ConflictException(
                    "Medicine with barcode already exists: " + barcode);
        }

        Category category = findCategory(request.categoryId());

        Medicine medicine = new Medicine();

        medicine.setName(request.name().trim());
        medicine.setGenericName(normalizeText(request.genericName()));
        medicine.setCategory(category);
        medicine.setManufacturer(normalizeText(request.manufacturer()));
        medicine.setBarcode(barcode);
        medicine.setReorderLevel(request.reorderLevel());
        medicine.setDescription(normalizeText(request.description()));
        medicine.setStatus(RecordStatus.ACTIVE);

        Medicine savedMedicine = medicineRepository.save(medicine);

        return mapToResponse(savedMedicine);
    }

    public MedicineResponse updateMedicine(
            Long id,
            MedicineRequest request) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id));

        String barcode = normalizeBarcode(request.barcode());

        if (barcode != null
                && medicineRepository.existsByBarcodeAndIdNot(barcode, id)) {

            throw new ConflictException(
                    "Medicine with barcode already exists: " + barcode);
        }

        Category category = findCategory(request.categoryId());

        medicine.setName(request.name().trim());
        medicine.setGenericName(normalizeText(request.genericName()));
        medicine.setCategory(category);
        medicine.setManufacturer(normalizeText(request.manufacturer()));
        medicine.setBarcode(barcode);
        medicine.setReorderLevel(request.reorderLevel());
        medicine.setDescription(normalizeText(request.description()));

        Medicine updatedMedicine = medicineRepository.save(medicine);

        return mapToResponse(updatedMedicine);
    }

    public void deactivateMedicine(Long id) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Medicine not found with id: " + id));

        medicine.setStatus(RecordStatus.INACTIVE);

        medicineRepository.save(medicine);
    }

    private Category findCategory(Long categoryId) {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));
    }

    private MedicineResponse mapToResponse(Medicine medicine) {

        return new MedicineResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getGenericName(),
                medicine.getCategory().getId(),
                medicine.getCategory().getName(),
                medicine.getManufacturer(),
                medicine.getBarcode(),
                medicine.getReorderLevel(),
                medicine.getDescription(),
                medicine.getStatus(),
                medicine.getCreatedAt(),
                medicine.getUpdatedAt()
        );
    }

    private String normalizeText(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizeBarcode(String barcode) {

        if (barcode == null || barcode.isBlank()) {
            return null;
        }

        return barcode.trim();
    }
}