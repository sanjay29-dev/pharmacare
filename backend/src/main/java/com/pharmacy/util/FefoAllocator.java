package com.pharmacy.util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.pharmacy.entity.Batch;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.InsufficientStockException;

public class FefoAllocator {

    public List<Allocation> allocate(
            List<Batch> batches,
            int requestedQuantity) {

        if (requestedQuantity <= 0) {
            throw new BadRequestException(
                    "Requested quantity must be greater than zero.");
        }

        if (batches == null || batches.isEmpty()) {
            throw new InsufficientStockException(
                    "Insufficient stock.");
        }

        LocalDate today = LocalDate.now();

        List<Batch> usableBatches = batches.stream()
                .filter(batch -> batch.getQuantity() > 0)
                .filter(batch -> !batch.getExpiryDate().isBefore(today))
                .sorted(
                        Comparator
                                .comparing(Batch::getExpiryDate)
                                .thenComparing(Batch::getId)
                )
                .toList();

        int availableQuantity = usableBatches.stream()
                .mapToInt(Batch::getQuantity)
                .sum();

        if (availableQuantity < requestedQuantity) {
            throw new InsufficientStockException(
                    "Insufficient stock. Available: "
                            + availableQuantity
                            + ", requested: "
                            + requestedQuantity);
        }

        List<Allocation> allocations = new ArrayList<>();

        int remaining = requestedQuantity;

        for (Batch batch : usableBatches) {

            if (remaining == 0) {
                break;
            }

            int allocatedQuantity =
                    Math.min(batch.getQuantity(), remaining);

            allocations.add(
                    new Allocation(
                            batch,
                            allocatedQuantity));

            remaining -= allocatedQuantity;
        }

        return allocations;
    }

    public record Allocation(
            Batch batch,
            int quantity) {
    }
}