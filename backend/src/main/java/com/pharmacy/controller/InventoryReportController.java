
package com.pharmacy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.InventoryReportResponse;
import com.pharmacy.service.InventoryReportService;

@RestController
@RequestMapping("/api/reports")
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    public InventoryReportController(
            InventoryReportService inventoryReportService) {
        this.inventoryReportService = inventoryReportService;
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryReportResponse> getInventoryReport(
            @RequestParam(defaultValue = "30") int expiringDays) {

        return ResponseEntity.ok(
                inventoryReportService.getInventoryReport(expiringDays));
    }
}
