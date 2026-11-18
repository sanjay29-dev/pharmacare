package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.pharmacy.entity.SaleStatus;

public record SaleResponse(
        Long id,
        String invoiceNumber,
        String customerName,
        LocalDateTime saleDate,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal totalAmount,
        SaleStatus status,
        String createdBy,
        List<SaleItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}