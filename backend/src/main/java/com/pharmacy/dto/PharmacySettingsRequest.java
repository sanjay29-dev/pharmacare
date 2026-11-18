package com.pharmacy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PharmacySettingsRequest(

        @NotBlank(message = "Pharmacy name is required")
        @Size(max = 150)
        String pharmacyName,

        @Size(max = 500)
        String address,

        @Size(max = 20)
        String phone,

        @Email(message = "Enter a valid email address")
        @Size(max = 150)
        String email,

        @Size(max = 30)
        String gstNumber
) {
}