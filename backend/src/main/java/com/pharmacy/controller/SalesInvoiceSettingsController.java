
package com.pharmacy.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.SalesInvoiceSettingsRequest;
import com.pharmacy.entity.SalesInvoiceSettings;
import com.pharmacy.service.SalesInvoiceSettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings/sales-invoice")
@Validated
public class SalesInvoiceSettingsController {

    private final SalesInvoiceSettingsService service;

    public SalesInvoiceSettingsController(
            SalesInvoiceSettingsService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public SalesInvoiceSettings getSettings() {
        return service.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SalesInvoiceSettings updateSettings(
            @Valid @RequestBody SalesInvoiceSettingsRequest request) {
        return service.updateSettings(request);
    }
}
