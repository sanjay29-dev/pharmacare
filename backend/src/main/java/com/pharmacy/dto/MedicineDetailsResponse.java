package com.pharmacy.dto;

import java.util.List;

public record MedicineDetailsResponse(

        MedicineResponse medicine,

        StockStatusResponse stockStatus,

        List<BatchResponse> batches,

        List<StockTransactionResponse> transactions
) {
}