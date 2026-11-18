package com.pharmacy.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.pharmacy.entity.Batch;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.InsufficientStockException;

class FefoAllocatorTest {

    private FefoAllocator fefoAllocator;

    @BeforeEach
    void setUp() {
        fefoAllocator = new FefoAllocator();
    }

    @Test
    void shouldAllocateFromSingleBatch() {

        Batch batch = createBatch(
                1L,
                "BATCH-A",
                LocalDate.now().plusDays(30),
                20
        );

        List<FefoAllocator.Allocation> result =
                fefoAllocator.allocate(
                        List.of(batch),
                        5
                );

        assertEquals(1, result.size());
        assertEquals(batch, result.get(0).batch());
        assertEquals(5, result.get(0).quantity());
    }

    @Test
    void shouldSplitAllocationAcrossTwoBatches() {

        Batch batchA = createBatch(
                1L,
                "BATCH-A",
                LocalDate.now().plusDays(30),
                10
        );

        Batch batchB = createBatch(
                2L,
                "BATCH-B",
                LocalDate.now().plusDays(60),
                50
        );

        List<FefoAllocator.Allocation> result =
                fefoAllocator.allocate(
                        List.of(batchB, batchA),
                        15
                );

        assertEquals(2, result.size());

        assertEquals(batchA, result.get(0).batch());
        assertEquals(10, result.get(0).quantity());

        assertEquals(batchB, result.get(1).batch());
        assertEquals(5, result.get(1).quantity());
    }

    @Test
    void shouldSkipExpiredBatch() {

        Batch expiredBatch = createBatch(
                1L,
                "EXPIRED",
                LocalDate.now().minusDays(1),
                100
        );

        Batch validBatch = createBatch(
                2L,
                "VALID",
                LocalDate.now().plusDays(30),
                20
        );

        List<FefoAllocator.Allocation> result =
                fefoAllocator.allocate(
                        List.of(expiredBatch, validBatch),
                        5
                );

        assertEquals(1, result.size());
        assertEquals(validBatch, result.get(0).batch());
        assertEquals(5, result.get(0).quantity());
    }

    @Test
    void shouldSkipEmptyBatch() {

        Batch emptyBatch = createBatch(
                1L,
                "EMPTY",
                LocalDate.now().plusDays(10),
                0
        );

        Batch validBatch = createBatch(
                2L,
                "VALID",
                LocalDate.now().plusDays(30),
                20
        );

        List<FefoAllocator.Allocation> result =
                fefoAllocator.allocate(
                        List.of(emptyBatch, validBatch),
                        5
                );

        assertEquals(1, result.size());
        assertEquals(validBatch, result.get(0).batch());
        assertEquals(5, result.get(0).quantity());
    }

    @Test
    void shouldAllocateExactQuantity() {

        Batch batch = createBatch(
                1L,
                "BATCH-A",
                LocalDate.now().plusDays(30),
                10
        );

        List<FefoAllocator.Allocation> result =
                fefoAllocator.allocate(
                        List.of(batch),
                        10
                );

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).quantity());
    }

    @Test
    void shouldThrowWhenStockIsInsufficient() {

        Batch batchA = createBatch(
                1L,
                "BATCH-A",
                LocalDate.now().plusDays(30),
                10
        );

        Batch batchB = createBatch(
                2L,
                "BATCH-B",
                LocalDate.now().plusDays(60),
                5
        );

        assertThrows(
                InsufficientStockException.class,
                () -> fefoAllocator.allocate(
                        List.of(batchA, batchB),
                        16
                )
        );
    }

    @Test
    void shouldRejectZeroQuantity() {

        Batch batch = createBatch(
                1L,
                "BATCH-A",
                LocalDate.now().plusDays(30),
                10
        );

        assertThrows(
                BadRequestException.class,
                () -> fefoAllocator.allocate(
                        List.of(batch),
                        0
                )
        );
    }

    private Batch createBatch(
            Long id,
            String batchNumber,
            LocalDate expiryDate,
            int quantity) {

        Batch batch = new Batch();

        batch.setBatchNumber(batchNumber);
        batch.setExpiryDate(expiryDate);
        batch.setQuantity(quantity);

        return batch;
    }
}