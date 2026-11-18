package com.pharmacy.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pharmacy.entity.StockTransaction;
import com.pharmacy.entity.StockTransactionType;

public interface StockTransactionRepository
        extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByBatchIdOrderByTransactionDateDesc(
            Long batchId);

    List<StockTransaction> findByMedicineIdOrderByTransactionDateDesc(
            Long medicineId);

    @Query("""
            SELECT s
            FROM StockTransaction s
            WHERE (:medicineId IS NULL OR s.medicine.id = :medicineId)
              AND (:type IS NULL OR s.type = :type)
              AND (:fromDate IS NULL OR s.transactionDate >= :fromDate)
              AND (:toDate IS NULL OR s.transactionDate <= :toDate)
            ORDER BY s.transactionDate DESC
            """)
    List<StockTransaction> searchTransactions(
            @Param("medicineId") Long medicineId,
            @Param("type") StockTransactionType type,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);
}