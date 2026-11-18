
package com.pharmacy.dto;

public record DashboardSummaryResponse(

        int activeMedicineCount,
        int lowStockCount,
        int outOfStockCount,
        int expiredBatchCount,
        int expiringSoonBatchCount,
        boolean lowStockAlertEnabled,
        boolean expiryAlertEnabled,
        int expiryAlertDays
) {
}
