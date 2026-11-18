package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.pharmacy.entity.StockStatus;

public record InventoryResponse(

        Long medicineId,

        String medicineName,

        String genericName,

        String categoryName,

        String manufacturer,

        Integer reorderLevel,

        int totalQty,

        int availableQty,

        int expiredQty,

        LocalDate earliestExpiry,

        BigDecimal stockValue,

        StockStatus status,

        boolean hasExpiredBatch,

        boolean hasExpiringSoonBatch
) {
}