
package com.pharmacy.dto;

import java.math.BigDecimal;

import com.pharmacy.entity.StockStatus;

public record MedicineSearchResponse(

        Long medicineId,
        String name,
        String genericName,
        String categoryName,
        String manufacturer,
        String barcode,
        Integer reorderLevel,
        int availableQty,
        int totalQty,
        StockStatus stockStatus,
        boolean hasExpiredBatch,
        boolean hasExpiringSoonBatch,
        BigDecimal sellingPrice

) {
}
