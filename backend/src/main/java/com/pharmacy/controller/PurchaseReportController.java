
package com.pharmacy.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.PurchaseReportResponse;
import com.pharmacy.service.PurchaseReportService;

@RestController
@RequestMapping("/api/reports")
public class PurchaseReportController {

    private final PurchaseReportService purchaseReportService;

    public PurchaseReportController(
            PurchaseReportService purchaseReportService) {
        this.purchaseReportService = purchaseReportService;
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PurchaseReportResponse> getPurchaseReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return ResponseEntity.ok(
                purchaseReportService.getPurchaseReport(from, to));
    }
}
