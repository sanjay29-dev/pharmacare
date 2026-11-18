
package com.pharmacy.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.DashboardSalesResponse;
import com.pharmacy.dto.TopSellingMedicineResponse;
import com.pharmacy.service.DashboardSalesService;
import com.pharmacy.service.DashboardTopSellingService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardSalesController {

    private final DashboardSalesService dashboardSalesService;
    private final DashboardTopSellingService dashboardTopSellingService;

    public DashboardSalesController(
            DashboardSalesService dashboardSalesService,
            DashboardTopSellingService dashboardTopSellingService) {
        this.dashboardSalesService = dashboardSalesService;
        this.dashboardTopSellingService = dashboardTopSellingService;
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public DashboardSalesResponse getSalesSummary() {
        return dashboardSalesService.getSalesSummary();
    }
    
    @GetMapping("/top-selling")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public List<TopSellingMedicineResponse> getTopSellingMedicines() {
        return dashboardTopSellingService.getTopSellingMedicines();
    }
}
