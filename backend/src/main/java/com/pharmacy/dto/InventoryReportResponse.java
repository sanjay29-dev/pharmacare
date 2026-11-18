
package com.pharmacy.dto;

import java.math.BigDecimal;
import java.util.List;

public record InventoryReportResponse(
        int totalMedicines,
        long lowStockMedicines,
        long outOfStockMedicines,
        int totalStockQuantity,
        int availableStockQuantity,
        int expiredBatchCount,
        int expiringBatchCount,
        BigDecimal inventoryValue,
        List<InventoryResponse> inventory,
        List<InventoryResponse> lowStockItems,
        List<InventoryResponse> outOfStockItems,
        List<ExpiryBatchResponse> expiredBatches,
        List<ExpiryBatchResponse> expiringBatches
) {
}
