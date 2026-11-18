
package com.pharmacy.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.DashboardSalesResponse;
import com.pharmacy.entity.SaleStatus;
import com.pharmacy.repository.SaleRepository;

@Service
@Transactional(readOnly = true)
public class DashboardSalesService {

    private final SaleRepository saleRepository;

    public DashboardSalesService(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    public DashboardSalesResponse getSalesSummary() {
        LocalDate today = LocalDate.now();

        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime tomorrowStart = today.plusDays(1).atStartOfDay();

        LocalDate weekStartDate =
                today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        LocalDateTime weekStart = weekStartDate.atStartOfDay();

        LocalDate monthStartDate = today.withDayOfMonth(1);
        LocalDateTime monthStart = monthStartDate.atStartOfDay();

        LocalDateTime now = LocalDateTime.now();

        BigDecimal todaySales = getSales(todayStart, tomorrowStart);
        BigDecimal weekSales = getSales(weekStart, now.plusNanos(1));
        BigDecimal monthSales = getSales(monthStart, now.plusNanos(1));

        long todayCount = getCount(todayStart, tomorrowStart);
        long weekCount = getCount(weekStart, now.plusNanos(1));
        long monthCount = getCount(monthStart, now.plusNanos(1));

        return new DashboardSalesResponse(
                todaySales,
                weekSales,
                monthSales,
                todayCount,
                weekCount,
                monthCount
        );
    }

    private BigDecimal getSales(LocalDateTime from, LocalDateTime to) {
        return saleRepository.sumSalesByStatusAndDateRange(
                SaleStatus.COMPLETED, from, to);
    }

    private long getCount(LocalDateTime from, LocalDateTime to) {
        return saleRepository.countSalesByStatusAndDateRange(
                SaleStatus.COMPLETED, from, to);
    }
}
