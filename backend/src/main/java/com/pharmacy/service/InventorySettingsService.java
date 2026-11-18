
package com.pharmacy.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.InventorySettingsRequest;
import com.pharmacy.entity.InventorySettings;
import com.pharmacy.repository.InventorySettingsRepository;

@Service
public class InventorySettingsService {

    private final InventorySettingsRepository repository;

    public InventorySettingsService(
            InventorySettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public InventorySettings getSettings() {
        return repository.findById(1L)
                .orElseGet(InventorySettings::new);
    }

    @Transactional
    public InventorySettings updateSettings(
            InventorySettingsRequest request) {

        InventorySettings settings = repository.findById(1L)
                .orElseGet(InventorySettings::new);

        settings.setLowStockAlertEnabled(
                request.lowStockAlertEnabled());

        settings.setExpiryAlertEnabled(
                request.expiryAlertEnabled());

        settings.setExpiryAlertDays(
                request.expiryAlertDays());

        settings.setDefaultReorderLevel(
                request.defaultReorderLevel());

        return repository.save(settings);
    }
}
