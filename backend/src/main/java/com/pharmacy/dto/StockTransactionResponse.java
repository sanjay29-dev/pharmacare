package com.pharmacy.dto;

import java.time.LocalDateTime;

import com.pharmacy.entity.StockTransactionType;

public record StockTransactionResponse(

        Long id,

        Long medicineId,

        String medicineName,

        Long batchId,

        String batchNumber,

        StockTransactionType type,

        Integer quantityChange,

        Integer balanceAfter,

        String reference,

        String note,

        String createdBy,

        LocalDateTime transactionDate
) {
}