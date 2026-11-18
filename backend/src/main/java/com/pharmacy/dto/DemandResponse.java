package com.pharmacy.dto;

public record DemandResponse(
        Long medicineId,
        String medicineName,
        int soldQty,
        double avgDaily,
        double avgMonthly,
        int availableQty,
        int reorderLevel,
        int reorderPoint,
        int suggestedQty,
        int daysRemaining,
        boolean reorderRecommended
) {}