package com.pharmacy.dto;

import java.time.LocalDateTime;

import com.pharmacy.entity.RecordStatus;

public record MedicineResponse(
        Long id,
        String name,
        String genericName,
        Long categoryId,
        String categoryName,
        String manufacturer,
        String barcode,
        Integer reorderLevel,
        String description,
        RecordStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}