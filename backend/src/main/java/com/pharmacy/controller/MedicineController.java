package com.pharmacy.controller;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.MedicineDetailsResponse;
import com.pharmacy.dto.MedicineRequest;
import com.pharmacy.dto.MedicineResponse;
import com.pharmacy.dto.MedicineSearchResponse;
import com.pharmacy.entity.StockStatus;
import com.pharmacy.service.InventoryService;
import com.pharmacy.service.MedicineSearchService;
import com.pharmacy.service.MedicineService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;
    private final InventoryService inventoryService;
    private final MedicineSearchService medicineSearchService;

    public MedicineController(
            MedicineService medicineService,
            InventoryService inventoryService,
            MedicineSearchService medicineSearchService) {

        this.medicineService = medicineService;
        this.inventoryService = inventoryService;
        this.medicineSearchService = medicineSearchService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<MedicineResponse>> getAllMedicines(
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(
                    medicineService.searchMedicines(search.trim())
            );
        }

        return ResponseEntity.ok(
                medicineService.getAllMedicines()
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<MedicineSearchResponse>> searchMedicines(
            @RequestParam String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) StockStatus stockStatus) {

        return ResponseEntity.ok(
                medicineSearchService.search(
                        keyword,
                        categoryId,
                        manufacturer,
                        stockStatus
                )
        );
    }

    @GetMapping("/barcode/{barcode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MedicineSearchResponse> getByBarcode(
            @PathVariable String barcode) {

        return ResponseEntity.ok(
                medicineSearchService.findByBarcode(barcode)
        );
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MedicineDetailsResponse> getMedicineDetails(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryService.getMedicineDetails(id)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MedicineResponse> getMedicineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.getMedicineById(id)
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponse> createMedicine(
            @Valid @RequestBody MedicineRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(medicineService.createMedicine(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {

        return ResponseEntity.ok(
                medicineService.updateMedicine(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateMedicine(
            @PathVariable Long id) {

        medicineService.deactivateMedicine(id);

        return ResponseEntity.noContent().build();
    }
}