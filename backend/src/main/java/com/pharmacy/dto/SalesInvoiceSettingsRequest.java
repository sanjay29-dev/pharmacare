
package com.pharmacy.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SalesInvoiceSettingsRequest(

        @NotBlank(message = "Invoice prefix is required")
        @Size(max = 20, message = "Invoice prefix must not exceed 20 characters")
        String invoicePrefix,

        @DecimalMin(value = "0.00", message = "Tax rate cannot be negative")
        @DecimalMax(value = "100.00", message = "Tax rate cannot exceed 100%")
        BigDecimal defaultTaxRate,

        @DecimalMin(value = "0.00", message = "Discount rate cannot be negative")
        @DecimalMax(value = "100.00", message = "Discount rate cannot exceed 100%")
        BigDecimal defaultDiscountRate,

        @Size(max = 500, message = "Invoice footer must not exceed 500 characters")
        String invoiceFooter
) {
}
