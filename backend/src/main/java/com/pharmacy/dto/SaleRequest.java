package com.pharmacy.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record SaleRequest(

        @Size(max = 150, message = "Customer name must not exceed 150 characters")
        String customerName,

        @NotEmpty(message = "At least one sale item is required")
        List<@Valid SaleItemRequest> items,

        @DecimalMin(value = "0.00", message = "Discount cannot be negative")
        BigDecimal discount,

        @DecimalMin(value = "0.00", message = "Tax cannot be negative")
        BigDecimal tax
) {
}