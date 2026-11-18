
package com.pharmacy.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.SupplierPurchaseReportResponse;
import com.pharmacy.repository.PurchaseRepository;

@Service
@Transactional(readOnly = true)
public class SupplierPurchaseReportService {

    private final PurchaseRepository purchaseRepository;

    public SupplierPurchaseReportService(
            PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    public List<SupplierPurchaseReportResponse> getPurchasesBySupplier(
            LocalDate from, LocalDate to) {

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Both from and to dates are required.");
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "The from date must be on or before the to date.");
        }

        return purchaseRepository.findPurchasesBySupplier(from, to);
    }
}
