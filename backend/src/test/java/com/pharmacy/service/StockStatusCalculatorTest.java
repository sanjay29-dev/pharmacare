package com.pharmacy.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.pharmacy.dto.StockStatusResponse;
import com.pharmacy.entity.Batch;
import com.pharmacy.entity.StockStatus;



class StockStatusCalculatorTest {

	private StockStatusCalculator calculator;

	@BeforeEach
	void setUp() {
		calculator = new StockStatusCalculator(30);
	}

	@Test
	void shouldReturnNormalWhenStockIsHealthy() {

		Batch batch = createBatch(100, LocalDate.now().plusDays(90));

		StockStatusResponse response = calculator.calculate(List.of(batch), 10);

		assertEquals(StockStatus.NORMAL, response.status());
		assertEquals(100, response.totalQty());
		assertEquals(100, response.availableQty());
		assertEquals(0, response.expiredQty());
	}

	@Test
	void shouldReturnLowStockWhenAvailableQuantityIsAtReorderLevel() {

		Batch batch = createBatch(10, LocalDate.now().plusDays(90));

		StockStatusResponse response = calculator.calculate(List.of(batch), 10);

		assertEquals(StockStatus.LOW_STOCK, response.status());
		assertEquals(10, response.availableQty());
	}

	@Test
	void shouldReturnOutOfStockWhenTotalQuantityIsZero() {

		Batch batch = createBatch(0, LocalDate.now().plusDays(90));

		StockStatusResponse response = calculator.calculate(List.of(batch), 10);

		assertEquals(StockStatus.OUT_OF_STOCK, response.status());
		assertEquals(0, response.totalQty());
		assertEquals(0, response.availableQty());
	}

	@Test
	void shouldReturnExpiredWhenAllStockIsExpired() {

		Batch batch = createBatch(50, LocalDate.now().minusDays(5));

		StockStatusResponse response = calculator.calculate(List.of(batch), 10);

		assertEquals(StockStatus.EXPIRED, response.status());
		assertEquals(50, response.totalQty());
		assertEquals(0, response.availableQty());
		assertEquals(50, response.expiredQty());
		assertTrue(response.hasExpiredBatch());
	}

	@Test
	void shouldReturnExpiringSoonWhenUsableBatchExpiresWithin30Days() {

		Batch batch = createBatch(50, LocalDate.now().plusDays(20));

		StockStatusResponse response = calculator.calculate(List.of(batch), 10);

		assertEquals(StockStatus.EXPIRING_SOON, response.status());

		assertEquals(50, response.availableQty());
		assertTrue(response.hasExpiringSoonBatch());
	}

	private Batch createBatch(int quantity, LocalDate expiryDate) {

		Batch batch = new Batch();

		batch.setBatchNumber("TEST-BATCH");
		batch.setExpiryDate(expiryDate);
		batch.setQuantity(quantity);

		batch.setPurchasePrice(new BigDecimal("10.00"));
		batch.setSellingPrice(new BigDecimal("12.00"));
		batch.setMrp(new BigDecimal("15.00"));

		return batch;
	}
}