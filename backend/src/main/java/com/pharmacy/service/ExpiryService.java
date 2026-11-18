
package com.pharmacy.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.ExpiryBatchResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.InventorySettings;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.InventorySettingsRepository;

@Service
@Transactional(readOnly = true)
public class ExpiryService {

    private static final int DEFAULT_EXPIRY_DAYS = 30;

    private final BatchRepository batchRepository;
    private final InventorySettingsRepository settingsRepository;

    public ExpiryService(
            BatchRepository batchRepository,
            InventorySettingsRepository settingsRepository) {
        this.batchRepository = batchRepository;
        this.settingsRepository = settingsRepository;
    }

    public List<ExpiryBatchResponse> getExpiredBatches() {
        LocalDate today = LocalDate.now();
        int configuredDays = getConfiguredExpiryDays();

        return batchRepository.findExpiredBatchesWithStock(today)
                .stream()
                .map(batch -> mapBatch(batch, today, configuredDays))
                .toList();
    }

    public List<ExpiryBatchResponse> getExpiringBatches(Integer days) {

        int warningDays = days != null
                ? days
                : getConfiguredExpiryDays();

        if (warningDays < 1 || warningDays > 365) {
            throw new IllegalArgumentException(
                    "Days must be between 1 and 365.");
        }

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(warningDays);

        return batchRepository.findExpiringBatches(today, endDate)
                .stream()
                .map(batch -> mapBatch(batch, today, warningDays))
                .toList();
    }

    public List<ExpiryBatchResponse> getAllBatches() {
        LocalDate today = LocalDate.now();
        int configuredDays = getConfiguredExpiryDays();

        return batchRepository.findAllOrderByExpiryDateAsc()
                .stream()
                .map(batch -> mapBatch(batch, today, configuredDays))
                .toList();
    }

    private int getConfiguredExpiryDays() {
        InventorySettings settings = settingsRepository.findById(1L)
                .orElseGet(InventorySettings::new);

        Integer days = settings.getExpiryAlertDays();

        if (days == null || days < 1 || days > 365) {
            return DEFAULT_EXPIRY_DAYS;
        }

        return days;
    }

    private ExpiryBatchResponse mapBatch(
            Batch batch,
            LocalDate today,
            int warningDays) {

        LocalDate expiryDate = batch.getExpiryDate();
        long days = ChronoUnit.DAYS.between(today, expiryDate);

        String status;

        if (days < 0) {
            status = "EXPIRED";
        } else if (days == 0) {
            status = "EXPIRES_TODAY";
        } else if (days <= warningDays) {
            status = "EXPIRING_SOON";
        } else {
            status = "GOOD";
        }

        return new ExpiryBatchResponse(
                batch.getId(),
                batch.getMedicine().getId(),
                batch.getMedicine().getName(),
                batch.getBatchNumber(),
                expiryDate,
                Math.toIntExact(days),
                batch.getQuantity(),
                batch.getPurchasePrice(),
                batch.getSellingPrice(),
                status
        );
    }
}
