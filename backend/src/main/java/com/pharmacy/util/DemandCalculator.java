package com.pharmacy.util;

public final class DemandCalculator {

    private DemandCalculator() {
        // Utility class
    }

    public static double averageDailyDemand(int soldQty, int windowDays) {
        if (soldQty < 0) {
            throw new IllegalArgumentException("Sold quantity cannot be negative");
        }
        if (windowDays <= 0) {
            throw new IllegalArgumentException("Window days must be greater than zero");
        }

        return (double) soldQty / windowDays;
    }

    public static double averageMonthlyDemand(int soldQty, int windowDays) {
        return averageDailyDemand(soldQty, windowDays) * 30;
    }

    public static int reorderPoint(
            double avgDaily,
            int leadTimeDays,
            int reorderLevel) {

        validateInputs(avgDaily, leadTimeDays, reorderLevel);

        return (int) Math.ceil(avgDaily * leadTimeDays) + reorderLevel;
    }

    public static boolean shouldReorder(
            int availableQty,
            int soldQty,
            double avgDaily,
            int leadTimeDays,
            int reorderLevel) {

        if (availableQty < 0 || soldQty < 0) {
            throw new IllegalArgumentException("Quantities cannot be negative");
        }

        // No sales history: use reorder level as the fallback.
        if (soldQty == 0) {
            return availableQty <= reorderLevel;
        }

        return availableQty <= reorderPoint(
                avgDaily, leadTimeDays, reorderLevel);
    }

    public static int suggestedQuantity(
            int availableQty,
            double avgDaily,
            int coverDays,
            int reorderLevel) {

        validateInputs(avgDaily, 1, reorderLevel);

        if (availableQty < 0 || coverDays <= 0) {
            throw new IllegalArgumentException(
                    "Stock cannot be negative and cover days must be positive");
        }

        int targetStock =
                (int) Math.ceil(avgDaily * coverDays) + reorderLevel;

        return Math.max(reorderLevel, targetStock - availableQty);
    }

    private static void validateInputs(
            double avgDaily,
            int leadTimeDays,
            int reorderLevel) {

        if (!Double.isFinite(avgDaily) || avgDaily < 0) {
            throw new IllegalArgumentException(
                    "Average daily demand must be finite and non-negative");
        }
        if (leadTimeDays <= 0 || reorderLevel < 0) {
            throw new IllegalArgumentException("Invalid reorder settings");
        }
    }
}