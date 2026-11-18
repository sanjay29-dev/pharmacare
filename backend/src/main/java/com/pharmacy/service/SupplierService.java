package com.pharmacy.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.SupplierRequest;
import com.pharmacy.dto.SupplierResponse;
import com.pharmacy.entity.RecordStatus;
import com.pharmacy.entity.Supplier;
import com.pharmacy.exception.ConflictException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.PurchaseRepository;
import com.pharmacy.repository.SupplierRepository;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;

    public SupplierService(
            SupplierRepository supplierRepository,
            PurchaseRepository purchaseRepository) {

        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {

        return supplierRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier not found with id: " + id));

        return mapToResponse(supplier);
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> searchSuppliers(String name) {

        return supplierRepository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SupplierResponse createSupplier(SupplierRequest request) {

        String name = request.name().trim();

        if (supplierRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException(
                    "Supplier with name already exists: " + name);
        }

        Supplier supplier = new Supplier();

        supplier.setName(name);
        supplier.setPhone(normalizeText(request.phone()));
        supplier.setEmail(normalizeText(request.email()));
        supplier.setAddress(normalizeText(request.address()));
        supplier.setGstNumber(normalizeText(request.gstNumber()));
        supplier.setStatus(RecordStatus.ACTIVE);

        Supplier savedSupplier =
                supplierRepository.save(supplier);

        return mapToResponse(savedSupplier);
    }

    public SupplierResponse updateSupplier(
            Long id,
            SupplierRequest request) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier not found with id: " + id));

        String name = request.name().trim();

        if (supplierRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException(
                    "Supplier with name already exists: " + name);
        }

        supplier.setName(name);
        supplier.setPhone(normalizeText(request.phone()));
        supplier.setEmail(normalizeText(request.email()));
        supplier.setAddress(normalizeText(request.address()));
        supplier.setGstNumber(normalizeText(request.gstNumber()));

        Supplier updatedSupplier =
                supplierRepository.save(supplier);

        return mapToResponse(updatedSupplier);
    }

    public void deactivateSupplier(Long id) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Supplier not found with id: " + id));

        supplier.setStatus(RecordStatus.INACTIVE);

        supplierRepository.save(supplier);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {

    	long purchaseCount =
    	        purchaseRepository.countBySupplierId(
    	                supplier.getId());


        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getPhone(),
                supplier.getEmail(),
                supplier.getAddress(),
                supplier.getGstNumber(),
                supplier.getStatus(),
                supplier.getCreatedAt(),
                supplier.getUpdatedAt(),
                purchaseCount
        );
    }

    private String normalizeText(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}