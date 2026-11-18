package com.pharmacy.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DemandCalculatorTest {

    @Test
    void calculatesAverageDailyDemand() {
        assertEquals(3.0,
                DemandCalculator.averageDailyDemand(90, 30), 0.001);
    }

    @Test
    void calculatesAverageMonthlyDemand() {
        assertEquals(90.0,
                DemandCalculator.averageMonthlyDemand(90, 30), 0.001);
    }

    @Test
    void calculatesSpecificationReorderPoint() {
        assertEquals(50,
                DemandCalculator.reorderPoint(6, 5, 20));
    }

    @Test
    void recommendsReorderAtReorderPoint() {
        assertTrue(DemandCalculator.shouldReorder(
                50, 180, 6, 5, 20));
    }

    @Test
    void doesNotRecommendReorderAboveReorderPoint() {
        assertFalse(DemandCalculator.shouldReorder(
                51, 180, 6, 5, 20));
    }

    @Test
    void usesReorderLevelWhenThereIsNoSalesHistory() {
        assertTrue(DemandCalculator.shouldReorder(
                10, 0, 0, 5, 10));

        assertFalse(DemandCalculator.shouldReorder(
                11, 0, 0, 5, 10));
    }

    @Test
    void calculatesSuggestedQuantity() {
        assertEquals(105,
                DemandCalculator.suggestedQuantity(95, 6, 30, 20));
    }

    @Test
    void rejectsInvalidWindow() {
        assertThrows(IllegalArgumentException.class,
                () -> DemandCalculator.averageDailyDemand(10, 0));
    }
}