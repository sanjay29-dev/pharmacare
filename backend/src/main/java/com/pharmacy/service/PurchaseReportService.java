
package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.PurchaseReportResponse;
import com.pharmacy.entity.PurchaseStatus;
import com.pharmacy.repository.PurchaseRepository;

@Service
@Transactional(readOnly = true)
public class PurchaseReportService {

    private final PurchaseRepository purchaseRepository;

    public PurchaseReportService(PurchaseRepository purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    public PurchaseReportResponse getPurchaseReport(
            LocalDate from, LocalDate to) {

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Both from and to dates are required.");
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "The from date must be on or before the to date.");
        }

        BigDecimal totalAmount =
                purchaseRepository.sumPurchasesByStatusAndDateRange(
                        PurchaseStatus.RECEIVED, from, to);

        long purchaseCount =
                purchaseRepository.countPurchasesByStatusAndDateRange(
                        PurchaseStatus.RECEIVED, from, to);

        return new PurchaseReportResponse(
                from, to, totalAmount, purchaseCount);
    }
}
