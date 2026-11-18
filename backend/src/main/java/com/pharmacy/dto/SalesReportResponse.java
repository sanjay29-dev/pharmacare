
package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesReportResponse(
        LocalDate from,
        LocalDate to,
        String groupBy,
        BigDecimal totalSales,
        long transactionCount,
        List<SalesReportBucket> data
) {
}
