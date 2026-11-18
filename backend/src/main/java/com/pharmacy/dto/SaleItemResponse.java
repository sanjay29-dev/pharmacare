package com.pharmacy.dto;

import java.math.BigDecimal;

public record SaleItemResponse(
        Long id,
        Long medicineId,
        String medicineName,
        Long batchId,
        String batchNumber,
        Integer quantity,
        BigDecimal sellingPrice,
        BigDecimal lineTotal
) {
}