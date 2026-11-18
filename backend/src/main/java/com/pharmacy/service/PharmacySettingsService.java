package com.pharmacy.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.PharmacySettingsRequest;
import com.pharmacy.entity.PharmacySettings;
import com.pharmacy.repository.PharmacySettingsRepository;

@Service
public class PharmacySettingsService {

    private final PharmacySettingsRepository repository;

    public PharmacySettingsService(
            PharmacySettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PharmacySettings getSettings() {
        return repository.findById(1L)
                .orElseGet(PharmacySettings::new);
    }

    @Transactional
    public PharmacySettings updateSettings(
            PharmacySettingsRequest request) {

        PharmacySettings settings = repository.findById(1L)
                .orElseGet(PharmacySettings::new);

        settings.setPharmacyName(request.pharmacyName().trim());
        settings.setAddress(request.address());
        settings.setPhone(request.phone());
        settings.setEmail(request.email());
        settings.setGstNumber(request.gstNumber());

        return repository.save(settings);
    }
}