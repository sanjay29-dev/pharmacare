
package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseReportResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalAmount,
        long purchaseCount
) {
}
