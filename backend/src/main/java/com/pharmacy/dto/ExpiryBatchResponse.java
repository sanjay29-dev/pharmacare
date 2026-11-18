
package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpiryBatchResponse(
        Long batchId,
        Long medicineId,
        String medicineName,
        String batchNumber,
        LocalDate expiryDate,
        int daysRemaining,
        int quantity,
        BigDecimal purchasePrice,
        BigDecimal sellingPrice,
        String status
) {
}
