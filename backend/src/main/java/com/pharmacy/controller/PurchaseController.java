package com.pharmacy.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.pharmacy.dto.PurchaseRequest;
import com.pharmacy.dto.PurchaseResponse;
import com.pharmacy.entity.PurchaseStatus;
import com.pharmacy.service.PurchaseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

	private final PurchaseService purchaseService;

	public PurchaseController(PurchaseService purchaseService) {
		this.purchaseService = purchaseService;
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<PurchaseResponse> createPurchase(@Valid @RequestBody PurchaseRequest request) {

		PurchaseResponse response = purchaseService.createPurchase(request);

		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<PurchaseResponse>> getPurchases(
	        @RequestParam(required = false) Long supplierId,
	        @RequestParam(required = false) PurchaseStatus status) {

	    return ResponseEntity.ok(
	            purchaseService.searchPurchases(
	                    supplierId,
	                    status
	            )
	    );
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable Long id) {

		return ResponseEntity.ok(purchaseService.getPurchaseById(id));
	}
}