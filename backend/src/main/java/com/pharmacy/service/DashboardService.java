
package com.pharmacy.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.DashboardSummaryResponse;
import com.pharmacy.dto.SalesReportResponse;
import com.pharmacy.entity.StockStatus;
import com.pharmacy.repository.InventorySettingsRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final InventoryService inventoryService;
    private final ExpiryService expiryService;
    private final SalesReportService salesReportService;
    private final InventorySettingsRepository settingsRepository;

    public DashboardService(
            InventoryService inventoryService,
            ExpiryService expiryService,
            SalesReportService salesReportService,
            InventorySettingsRepository settingsRepository) {

        this.inventoryService = inventoryService;
        this.expiryService = expiryService;
        this.salesReportService = salesReportService;
        this.settingsRepository = settingsRepository;
    }

    public DashboardSummaryResponse getSummary() {

        var settings = settingsRepository.findById(1L)
                .orElseGet(
                        com.pharmacy.entity.InventorySettings::new
                );

        boolean lowStockEnabled =
                settings.isLowStockAlertEnabled();

        boolean expiryEnabled =
                settings.isExpiryAlertEnabled();

        int expiryDays = settings.getExpiryAlertDays();

        var inventory = inventoryService.getInventory();

        int lowStockCount = lowStockEnabled
                ? (int) inventory.stream()
                        .filter(item ->
                                item.status() == StockStatus.LOW_STOCK)
                        .count()
                : 0;

        int outOfStockCount = (int) inventory.stream()
                .filter(item ->
                        item.status() == StockStatus.OUT_OF_STOCK)
                .count();

        int expiredBatchCount = expiryEnabled
                ? expiryService.getExpiredBatches().size()
                : 0;

        int expiringSoonBatchCount = expiryEnabled
                ? expiryService.getExpiringBatches(expiryDays).size()
                : 0;

        return new DashboardSummaryResponse(
                inventory.size(),
                lowStockCount,
                outOfStockCount,
                expiredBatchCount,
                expiringSoonBatchCount,
                lowStockEnabled,
                expiryEnabled,
                expiryDays
        );
    }

    public SalesReportResponse getDailySales(
            LocalDate from,
            LocalDate to) {

        return salesReportService.getReport(from, to, "DAY");
    }
}
