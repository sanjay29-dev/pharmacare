package com.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MedicineRequest(

        @NotBlank(message = "Medicine name is required")
        @Size(max = 150, message = "Medicine name must not exceed 150 characters")
        String name,

        @Size(max = 150, message = "Generic name must not exceed 150 characters")
        String genericName,

        @NotNull(message = "Category is required")
        Long categoryId,

        @Size(max = 150, message = "Manufacturer must not exceed 150 characters")
        String manufacturer,

        @Size(max = 100, message = "Barcode must not exceed 100 characters")
        String barcode,

        @NotNull(message = "Reorder level is required")
        @Min(value = 0, message = "Reorder level cannot be negative")
        Integer reorderLevel,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description
) {
}