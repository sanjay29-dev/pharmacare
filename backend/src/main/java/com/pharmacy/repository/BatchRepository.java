package com.pharmacy.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.pharmacy.entity.Batch;
import com.pharmacy.entity.Medicine;

public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByMedicineAndBatchNumber(
            Medicine medicine,
            String batchNumber);

    boolean existsByMedicineAndBatchNumber(
            Medicine medicine,
            String batchNumber);

    List<Batch> findByMedicineOrderByExpiryDateAscIdAsc(
            Medicine medicine);

    List<Batch> findByMedicineIdOrderByExpiryDateAscIdAsc(
            Long medicineId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT b
            FROM Batch b
            WHERE b.medicine.id = :medicineId
              AND b.quantity > 0
              AND b.expiryDate >= :today
            ORDER BY b.expiryDate ASC, b.id ASC
            """)
    List<Batch> findUsableBatchesForSale(
            @Param("medicineId") Long medicineId,
            @Param("today") LocalDate today);
    

    @Query("""
            SELECT b
            FROM Batch b
            WHERE b.quantity > 0
              AND b.expiryDate < :today
            ORDER BY b.expiryDate ASC, b.id ASC
            """)
    List<Batch> findExpiredBatchesWithStock(
            @Param("today") LocalDate today);

    @Query("""
            SELECT b
            FROM Batch b
            WHERE b.quantity > 0
              AND b.expiryDate >= :today
              AND b.expiryDate <= :endDate
            ORDER BY b.expiryDate ASC, b.id ASC
            """)
    List<Batch> findExpiringBatches(
            @Param("today") LocalDate today,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT b
            FROM Batch b
            ORDER BY b.expiryDate ASC, b.id ASC
            """)
    List<Batch> findAllOrderByExpiryDateAsc();

}