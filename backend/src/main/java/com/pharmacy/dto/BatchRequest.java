package com.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BatchRequest(

        @NotNull(message = "Medicine is required")
        Long medicineId,

        @NotBlank(message = "Batch number is required")
        @Size(max = 100, message = "Batch number must not exceed 100 characters")
        String batchNumber,

        LocalDate manufacturingDate,

        @NotNull(message = "Expiry date is required")
        LocalDate expiryDate,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be greater than zero")
        Integer quantity,

        @NotNull(message = "Purchase price is required")
        @DecimalMin(value = "0.01", message = "Purchase price must be greater than zero")
        BigDecimal purchasePrice,

        @NotNull(message = "Selling price is required")
        @DecimalMin(value = "0.00", message = "Selling price cannot be negative")
        BigDecimal sellingPrice,

        @NotNull(message = "MRP is required")
        @DecimalMin(value = "0.00", message = "MRP cannot be negative")
        BigDecimal mrp
) {
}