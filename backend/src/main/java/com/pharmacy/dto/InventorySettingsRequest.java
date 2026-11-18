
package com.pharmacy.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventorySettingsRequest(

        @NotNull(message = "Low-stock alert setting is required")
        Boolean lowStockAlertEnabled,

        @NotNull(message = "Expiry alert setting is required")
        Boolean expiryAlertEnabled,

        @NotNull(message = "Expiry alert days is required")
        @Min(value = 1, message = "Expiry alert days must be at least 1")
        @Max(value = 365, message = "Expiry alert days cannot exceed 365")
        Integer expiryAlertDays,

        @NotNull(message = "Default reorder level is required")
        @Min(value = 0, message = "Default reorder level cannot be negative")
        @Max(value = 100000, message = "Default reorder level is too large")
        Integer defaultReorderLevel
) {
}
