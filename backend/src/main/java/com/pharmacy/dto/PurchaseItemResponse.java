package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseItemResponse(

        Long id,

        Long medicineId,

        String medicineName,

        Long batchId,

        String batchNumber,

        LocalDate manufacturingDate,

        LocalDate expiryDate,

        Integer quantity,

        BigDecimal purchasePrice,

        BigDecimal sellingPrice,

        BigDecimal mrp,

        BigDecimal lineTotal
) {
}