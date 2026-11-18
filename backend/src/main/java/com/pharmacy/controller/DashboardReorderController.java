
package com.pharmacy.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.DemandResponse;
import com.pharmacy.service.DemandService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardReorderController {

    private final DemandService demandService;

    public DashboardReorderController(DemandService demandService) {
        this.demandService = demandService;
    }

    @GetMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<DemandResponse>> getReorderRecommendations() {
        return ResponseEntity.ok(
                demandService.getReorderRecommendations());
    }
}
