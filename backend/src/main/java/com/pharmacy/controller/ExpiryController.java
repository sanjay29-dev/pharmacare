
package com.pharmacy.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.ExpiryBatchResponse;
import com.pharmacy.service.ExpiryService;

@RestController
@RequestMapping("/api/expiry")
public class ExpiryController {

    private final ExpiryService expiryService;

    public ExpiryController(ExpiryService expiryService) {
        this.expiryService = expiryService;
    }

    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<ExpiryBatchResponse>> getExpiredBatches() {
        return ResponseEntity.ok(
                expiryService.getExpiredBatches()
        );
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<ExpiryBatchResponse>> getExpiringBatches(
            @RequestParam(required = false) Integer days) {

        return ResponseEntity.ok(
                expiryService.getExpiringBatches(days)
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<ExpiryBatchResponse>> getAllBatches() {
        return ResponseEntity.ok(
                expiryService.getAllBatches()
        );
    }
}
