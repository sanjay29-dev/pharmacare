package com.pharmacy.dto;

import java.time.LocalDate;

import com.pharmacy.entity.StockStatus;

public record StockStatusResponse(

        StockStatus status,

        int totalQty,

        int availableQty,

        int expiredQty,

        LocalDate earliestExpiry,

        boolean hasExpiredBatch,

        boolean hasExpiringSoonBatch
) {
}