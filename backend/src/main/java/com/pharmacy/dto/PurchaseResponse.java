package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.pharmacy.entity.PurchaseStatus;

public record PurchaseResponse(

        Long id,

        Long supplierId,

        String supplierName,

        String invoiceNumber,

        LocalDate purchaseDate,

        BigDecimal totalAmount,

        PurchaseStatus status,

        String notes,

        List<PurchaseItemResponse> items,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}