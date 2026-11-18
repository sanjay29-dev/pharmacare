
package com.pharmacy.dto;

import java.math.BigDecimal;

public record SalesReportBucket(
        String label,
        BigDecimal totalSales,
        long transactionCount
) {
}
