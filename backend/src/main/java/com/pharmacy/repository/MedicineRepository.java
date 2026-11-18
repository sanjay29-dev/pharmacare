package com.pharmacy.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pharmacy.entity.Medicine;
import com.pharmacy.entity.RecordStatus;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByBarcode(String barcode);

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByStatus(RecordStatus status);

    boolean existsByBarcode(String barcode);

    boolean existsByBarcodeAndIdNot(String barcode, Long id);

    @Query("""
            SELECT m
            FROM Medicine m
            WHERE m.status = com.pharmacy.entity.RecordStatus.ACTIVE
              AND (
                    LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(m.genericName, '')) LIKE
                       LOWER(CONCAT('%', :keyword, '%'))
                  )
              AND (:categoryId IS NULL OR m.category.id = :categoryId)
              AND (
                    :manufacturer IS NULL
                    OR LOWER(COALESCE(m.manufacturer, '')) LIKE
                       LOWER(CONCAT('%', :manufacturer, '%'))
                  )
            ORDER BY m.name ASC
            """)
    List<Medicine> searchActiveMedicines(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("manufacturer") String manufacturer);
}