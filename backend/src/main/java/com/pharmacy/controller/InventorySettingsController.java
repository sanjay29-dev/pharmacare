
package com.pharmacy.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.InventorySettingsRequest;
import com.pharmacy.entity.InventorySettings;
import com.pharmacy.service.InventorySettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings/inventory")
@Validated
public class InventorySettingsController {

    private final InventorySettingsService service;

    public InventorySettingsController(
            InventorySettingsService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public InventorySettings getSettings() {
        return service.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public InventorySettings updateSettings(
            @Valid @RequestBody InventorySettingsRequest request) {
        return service.updateSettings(request);
    }
}
