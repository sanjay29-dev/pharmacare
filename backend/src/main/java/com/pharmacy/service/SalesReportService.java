
package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.SalesReportBucket;
import com.pharmacy.dto.SalesReportResponse;
import com.pharmacy.entity.Sale;
import com.pharmacy.entity.SaleStatus;
import com.pharmacy.repository.SaleRepository;

@Service
@Transactional(readOnly = true)
public class SalesReportService {

    private final SaleRepository saleRepository;

    public SalesReportService(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    public SalesReportResponse getReport(
            LocalDate from, LocalDate to, String groupBy) {

        if (from == null || to == null) {
            throw new IllegalArgumentException(
                    "Both from and to dates are required.");
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "The from date must be on or before the to date.");
        }

        if (groupBy == null || groupBy.isBlank()) {
            throw new IllegalArgumentException(
                    "groupBy must be DAY, WEEK, or MONTH.");
        }

        String grouping = groupBy.trim().toUpperCase(Locale.ROOT);

        if (!List.of("DAY", "WEEK", "MONTH").contains(grouping)) {
            throw new IllegalArgumentException(
                    "Invalid groupBy. Use DAY, WEEK, or MONTH.");
        }

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime endExclusive = to.plusDays(1).atStartOfDay();

        List<Sale> sales =
                saleRepository
                        .findByStatusAndSaleDateGreaterThanEqualAndSaleDateLessThanOrderBySaleDateDesc(
                                SaleStatus.COMPLETED, start, endExclusive);

        Map<LocalDate, SalesReportBucket> grouped = new LinkedHashMap<>();
        BigDecimal totalSales = BigDecimal.ZERO;

        for (Sale sale : sales) {
            LocalDate saleDay = sale.getSaleDate().toLocalDate();
            LocalDate bucketStart = getBucketStart(saleDay, grouping);
            BigDecimal amount = sale.getTotalAmount() == null
                    ? BigDecimal.ZERO
                    : sale.getTotalAmount();

            SalesReportBucket previous = grouped.get(bucketStart);

            BigDecimal bucketTotal = amount;
            long bucketCount = 1;

            if (previous != null) {
                bucketTotal = previous.totalSales().add(amount);
                bucketCount = previous.transactionCount() + 1;
            }

            grouped.put(
                    bucketStart,
                    new SalesReportBucket(
                            formatLabel(bucketStart, grouping),
                            bucketTotal,
                            bucketCount));

            totalSales = totalSales.add(amount);
        }

        List<SalesReportBucket> buckets =
                new ArrayList<>(grouped.values());

        // Show buckets in chronological order.
        java.util.Collections.reverse(buckets);

        return new SalesReportResponse(
                from,
                to,
                grouping,
                totalSales,
                sales.size(),
                buckets);
    }

    private LocalDate getBucketStart(
            LocalDate date, String grouping) {

        return switch (grouping) {
            case "DAY" -> date;
            case "WEEK" -> date.with(
                    TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "MONTH" -> date.withDayOfMonth(1);
            default -> throw new IllegalArgumentException(
                    "Unsupported grouping: " + grouping);
        };
    }

    private String formatLabel(
            LocalDate date, String grouping) {

        return switch (grouping) {
            case "DAY" -> date.format(
                    DateTimeFormatter.ISO_LOCAL_DATE);
            case "WEEK" -> "Week of " + date.format(
                    DateTimeFormatter.ISO_LOCAL_DATE);
            case "MONTH" -> date.format(
                    DateTimeFormatter.ofPattern("yyyy-MM"));
            default -> date.toString();
        };
    }
}
