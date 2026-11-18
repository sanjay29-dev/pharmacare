
package com.pharmacy.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.SupplierPurchaseReportResponse;
import com.pharmacy.service.SupplierPurchaseReportService;

@RestController
@RequestMapping("/api/reports")
public class SupplierPurchaseReportController {

    private final SupplierPurchaseReportService reportService;

    public SupplierPurchaseReportController(
            SupplierPurchaseReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/purchases-by-supplier")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupplierPurchaseReportResponse>> getReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return ResponseEntity.ok(
                reportService.getPurchasesBySupplier(from, to));
    }
}
