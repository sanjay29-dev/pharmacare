package com.pharmacy.controller;

import java.util.List;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
	
import com.pharmacy.dto.BatchRequest;
import com.pharmacy.dto.BatchResponse;
import com.pharmacy.service.BatchService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping("/opening-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BatchResponse> addOpeningStock(
            @Valid @RequestBody BatchRequest request) {

        BatchResponse response = batchService.addOpeningStock(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/medicine/{medicineId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BatchResponse>> getBatchesByMedicine(
            @PathVariable Long medicineId) {

        return ResponseEntity.ok(
                batchService.getBatchesByMedicine(medicineId)
        );
    }

    @PostMapping("/{id}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adjustStock(
            @PathVariable Long id,
            @RequestParam int newQuantity,
            @RequestParam String reason) {

        batchService.adjustStock(id, newQuantity, reason);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/write-off")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> writeOff(
            @PathVariable Long id,
            @RequestParam String reason) {

        batchService.writeOff(id, reason);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BatchResponse> getBatchById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                batchService.getBatchById(id)
        );
    }
}