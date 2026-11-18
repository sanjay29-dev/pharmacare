
package com.pharmacy.dto;

public record TopSellingMedicineResponse(
        Long medicineId,
        String medicineName,
        Long soldQty
) {
}
