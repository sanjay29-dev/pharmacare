package com.pharmacy.dto;

public record DemandSummaryResponse(
        int demandWindowDays,
        long medicinesAnalysed,
        long medicinesSold,
        long reorderCount,
        long fastMovingCount,
        long slowMovingCount
) {}