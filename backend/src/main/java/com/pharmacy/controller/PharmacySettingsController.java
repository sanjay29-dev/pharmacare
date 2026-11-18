package com.pharmacy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.PharmacySettingsRequest;
import com.pharmacy.entity.PharmacySettings;
import com.pharmacy.service.PharmacySettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/settings/pharmacy")
@Validated
public class PharmacySettingsController {

    private final PharmacySettingsService service;

    public PharmacySettingsController(
            PharmacySettingsService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PharmacySettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PharmacySettings> updateSettings(
            @Valid @RequestBody PharmacySettingsRequest request) {

        return ResponseEntity.ok(service.updateSettings(request));
    }
}