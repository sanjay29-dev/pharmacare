package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BatchResponse(

        Long id,

        Long medicineId,

        String medicineName,

        String batchNumber,

        LocalDate manufacturingDate,

        LocalDate expiryDate,

        Integer quantity,

        BigDecimal purchasePrice,

        BigDecimal sellingPrice,

        BigDecimal mrp,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}