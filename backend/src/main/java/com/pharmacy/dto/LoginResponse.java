package com.pharmacy.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        String username,
        String role
) {
}