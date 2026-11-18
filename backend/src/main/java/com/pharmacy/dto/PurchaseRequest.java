package com.pharmacy.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseRequest(

        @NotNull(message = "Supplier is required")
        Long supplierId,

        @NotNull(message = "Purchase date is required")
        LocalDate purchaseDate,

        @NotEmpty(message = "At least one purchase item is required")
        List<@Valid PurchaseItemRequest> items,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes
) {
}