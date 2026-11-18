
package com.pharmacy.dto;

import java.math.BigDecimal;

public record DashboardSalesResponse(
        BigDecimal todaySales,
        BigDecimal weekSales,
        BigDecimal monthSales,
        long todayTransactions,
        long weekTransactions,
        long monthTransactions
) {
}
