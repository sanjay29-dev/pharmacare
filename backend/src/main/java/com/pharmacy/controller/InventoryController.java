package com.pharmacy.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.pharmacy.dto.InventoryResponse;
import com.pharmacy.dto.StockTransactionResponse;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<InventoryResponse>> getInventory() {
        return ResponseEntity.ok(
                inventoryService.getInventory()
        );
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(
                inventoryService.getLowStock()
        );
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<InventoryResponse>> getOutOfStock() {
        return ResponseEntity.ok(
                inventoryService.getOutOfStock()
        );
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<StockTransactionResponse>> getTransactions(

            @RequestParam(required = false)
            Long medicineId,

            @RequestParam(required = false)
            StockTransactionType type,

            @RequestParam(required = false)
            LocalDate from,

            @RequestParam(required = false)
            LocalDate to) {

        return ResponseEntity.ok(
                inventoryService.getTransactions(
                        medicineId,
                        type,
                        from,
                        to
                )
        );
    }
}