package com.pharmacy.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.pharmacy.dto.StockStatusResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.StockStatus;

@Service
public class StockStatusCalculator {

    private final int expiringSoonDays;

    public StockStatusCalculator(
            @Value("${pharmacy.expiring-soon-days:30}") int expiringSoonDays) {

        this.expiringSoonDays = expiringSoonDays;
    }

    public StockStatusResponse calculate(
            List<Batch> batches,
            int reorderLevel) {

        LocalDate today = LocalDate.now();
        LocalDate expiringSoonDate =
                today.plusDays(expiringSoonDays);

        int totalQty = 0;
        int availableQty = 0;
        int expiredQty = 0;

        boolean hasExpiredBatch = false;
        boolean hasExpiringSoonBatch = false;

        LocalDate earliestExpiry = null;

        for (Batch batch : batches) {

            int quantity = batch.getQuantity();

            totalQty += quantity;

            if (batch.getExpiryDate().isBefore(today)) {

                expiredQty += quantity;
                hasExpiredBatch = quantity > 0;

                continue;
            }

            if (quantity <= 0) {
                continue;
            }

            availableQty += quantity;

            if (earliestExpiry == null
                    || batch.getExpiryDate().isBefore(earliestExpiry)) {

                earliestExpiry = batch.getExpiryDate();
            }

            if (!batch.getExpiryDate().isAfter(expiringSoonDate)) {
                hasExpiringSoonBatch = true;
            }
        }

        StockStatus status;

        if (totalQty == 0) {
            status = StockStatus.OUT_OF_STOCK;
        } else if (availableQty == 0) {
            status = StockStatus.EXPIRED;
        } else if (availableQty <= reorderLevel) {
            status = StockStatus.LOW_STOCK;
        } else if (hasExpiringSoonBatch) {
            status = StockStatus.EXPIRING_SOON;
        } else {
            status = StockStatus.NORMAL;
        }

        return new StockStatusResponse(
                status,
                totalQty,
                availableQty,
                expiredQty,
                earliestExpiry,
                hasExpiredBatch,
                hasExpiringSoonBatch
        );
    }
}