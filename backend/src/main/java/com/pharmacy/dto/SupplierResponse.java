package com.pharmacy.dto;

import java.time.LocalDateTime;

import com.pharmacy.entity.RecordStatus;

public record SupplierResponse(
        Long id,
        String name,
        String phone,
        String email,
        String address,
        String gstNumber,
        RecordStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long numberOfPurchases
) {
}