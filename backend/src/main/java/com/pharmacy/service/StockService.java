package com.pharmacy.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.entity.Batch;
import com.pharmacy.entity.StockTransaction;
import com.pharmacy.entity.StockTransactionType;
import com.pharmacy.exception.BadRequestException;
import com.pharmacy.exception.InsufficientStockException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.BatchRepository;
import com.pharmacy.repository.StockTransactionRepository;

@Service
@Transactional
public class StockService {

    private final BatchRepository batchRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public StockService(
            BatchRepository batchRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.batchRepository = batchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    public void addStock(
            Batch batch,
            int quantity,
            StockTransactionType type,
            String reference,
            String note) {

        if (quantity <= 0) {
            throw new BadRequestException("Stock quantity must be greater than zero.");
        }

        int newQuantity = batch.getQuantity() + quantity;

        batch.setQuantity(newQuantity);
        batchRepository.save(batch);

        createTransaction(
                batch,
                type,
                quantity,
                newQuantity,
                reference,
                note
        );
    }

    public void reduceStock(
            Batch batch,
            int quantity,
            StockTransactionType type,
            String reference,
            String note) {

        if (quantity <= 0) {
            throw new BadRequestException("Stock quantity must be greater than zero.");
        }

        if (batch.getQuantity() < quantity) {
            throw new InsufficientStockException(
                    "Insufficient stock for batch " + batch.getBatchNumber()
            );
        }

        int newQuantity = batch.getQuantity() - quantity;

        batch.setQuantity(newQuantity);
        batchRepository.save(batch);

        createTransaction(
                batch,
                type,
                -quantity,
                newQuantity,
                reference,
                note
        );
    }

    public void adjustStock(
            Batch batch,
            int newQuantity,
            String reason) {

        if (newQuantity < 0) {
            throw new BadRequestException(
                    "Stock quantity cannot be negative."
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException(
                    "Adjustment reason is required."
            );
        }

        int oldQuantity = batch.getQuantity();
        int quantityChange = newQuantity - oldQuantity;

        if (quantityChange == 0) {
            throw new BadRequestException(
                    "New stock quantity must be different from the current quantity."
            );
        }

        batch.setQuantity(newQuantity);
        batchRepository.save(batch);

        createTransaction(
                batch,
                StockTransactionType.ADJUSTMENT,
                quantityChange,
                newQuantity,
                "STOCK ADJUSTMENT",
                reason.trim()
        );
    }

    public void writeOff(Batch batch, String reason) {

        if (batch.getQuantity() <= 0) {
            throw new BadRequestException(
                    "Batch has no stock available for write-off."
            );
        }

        if (batch.getExpiryDate() == null) {
            throw new BadRequestException(
                    "Batch expiry date is required."
            );
        }

        if (batch.getExpiryDate().isAfter(java.time.LocalDate.now())) {
            throw new BadRequestException(
                    "Only expired batches can be written off."
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException(
                    "Write-off reason is required."
            );
        }

        int quantity = batch.getQuantity();

        batch.setQuantity(0);
        batchRepository.save(batch);

        createTransaction(
                batch,
                StockTransactionType.EXPIRED,
                -quantity,
                0,
                "EXPIRED STOCK",
                reason.trim()
        );
    }

    @Transactional(readOnly = true)
    public List<StockTransaction> getBatchTransactions(Long batchId) {

        if (!batchRepository.existsById(batchId)) {
            throw new ResourceNotFoundException(
                    "Batch not found with id: " + batchId
            );
        }

        return stockTransactionRepository
                .findByBatchIdOrderByTransactionDateDesc(batchId);
    }

    private void createTransaction(
            Batch batch,
            StockTransactionType type,
            int quantityChange,
            int balanceAfter,
            String reference,
            String note) {

        StockTransaction transaction = new StockTransaction();

        transaction.setMedicine(batch.getMedicine());
        transaction.setBatch(batch);
        transaction.setType(type);
        transaction.setQuantityChange(quantityChange);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setReference(normalizeText(reference));
        transaction.setNote(normalizeText(note));

        stockTransactionRepository.save(transaction);
    }

    private String normalizeText(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}