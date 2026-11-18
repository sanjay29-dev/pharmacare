
package com.pharmacy.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.ExpiryBatchResponse;
import com.pharmacy.dto.InventoryReportResponse;
import com.pharmacy.dto.InventoryResponse;
import com.pharmacy.entity.StockStatus;

@Service
@Transactional(readOnly = true)
public class InventoryReportService {

    private final InventoryService inventoryService;
    private final ExpiryService expiryService;

    public InventoryReportService(
            InventoryService inventoryService,
            ExpiryService expiryService) {
        this.inventoryService = inventoryService;
        this.expiryService = expiryService;
    }

    public InventoryReportResponse getInventoryReport(int expiringDays) {

        if (expiringDays < 1 || expiringDays > 365) {
            throw new IllegalArgumentException(
                    "Expiring days must be between 1 and 365.");
        }

        List<InventoryResponse> inventory =
                inventoryService.getInventory();

        List<InventoryResponse> lowStockItems =
                inventoryService.getLowStock();

        List<InventoryResponse> outOfStockItems =
                inventory.stream()
                        .filter(item ->
                                item.status() == StockStatus.OUT_OF_STOCK)
                        .toList();

        List<ExpiryBatchResponse> expiredBatches =
                expiryService.getExpiredBatches();

        List<ExpiryBatchResponse> expiringBatches =
                expiryService.getExpiringBatches(expiringDays);

        int totalStockQuantity = inventory.stream()
                .mapToInt(InventoryResponse::totalQty)
                .sum();

        int availableStockQuantity = inventory.stream()
                .mapToInt(InventoryResponse::availableQty)
                .sum();

        BigDecimal inventoryValue = inventory.stream()
                .map(InventoryResponse::stockValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new InventoryReportResponse(
                inventory.size(),
                lowStockItems.size(),
                outOfStockItems.size(),
                totalStockQuantity,
                availableStockQuantity,
                expiredBatches.size(),
                expiringBatches.size(),
                inventoryValue,
                inventory,
                lowStockItems,
                outOfStockItems,
                expiredBatches,
                expiringBatches
        );
    }
}
