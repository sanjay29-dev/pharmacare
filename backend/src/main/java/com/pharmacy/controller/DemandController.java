package com.pharmacy.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacy.dto.DemandResponse;
import com.pharmacy.dto.DemandSummaryResponse;
import com.pharmacy.service.DemandService;

@RestController
@RequestMapping("/api/demand")
public class DemandController {

    private final DemandService demandService;

    public DemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<DemandSummaryResponse> getSummary() {
        return ResponseEntity.ok(demandService.getSummary());
    }

    @GetMapping("/fast-moving")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<DemandResponse>> getFastMoving() {
        return ResponseEntity.ok(demandService.getFastMoving());
    }

    @GetMapping("/slow-moving")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<DemandResponse>> getSlowMoving() {
        return ResponseEntity.ok(demandService.getSlowMoving());
    }

    @GetMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<DemandResponse>> getReorderRecommendations() {
        return ResponseEntity.ok(
                demandService.getReorderRecommendations());
    }
}