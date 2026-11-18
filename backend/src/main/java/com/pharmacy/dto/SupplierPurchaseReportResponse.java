
package com.pharmacy.dto;

import java.math.BigDecimal;

public record SupplierPurchaseReportResponse(
        Long supplierId,
        String supplierName,
        BigDecimal totalAmount,
        long purchaseCount
) {
}
