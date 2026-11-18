
package com.pharmacy.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.pharmacy.dto.SupplierPurchaseReportResponse;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmacy.entity.Purchase;
import com.pharmacy.entity.PurchaseStatus;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Optional<Purchase> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Purchase> findByStatusOrderByPurchaseDateDesc(
            PurchaseStatus status);

    List<Purchase> findBySupplierIdOrderByPurchaseDateDesc(
            Long supplierId);

    List<Purchase> findBySupplierIdAndStatusOrderByPurchaseDateDesc(
            Long supplierId,
            PurchaseStatus status);

    List<Purchase> findAllByOrderByPurchaseDateDesc();

    long countBySupplierId(Long supplierId);

    @Query("""
        SELECT COALESCE(SUM(p.totalAmount), 0)
        FROM Purchase p
        WHERE p.status = :status
          AND p.purchaseDate BETWEEN :from AND :to
        """)
    BigDecimal sumPurchasesByStatusAndDateRange(
            @Param("status") PurchaseStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
        SELECT COUNT(p)
        FROM Purchase p
        WHERE p.status = :status
          AND p.purchaseDate BETWEEN :from AND :to
        """)
    long countPurchasesByStatusAndDateRange(
            @Param("status") PurchaseStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
    

    @Query("""
        SELECT new com.pharmacy.dto.SupplierPurchaseReportResponse(
            p.supplier.id,
            p.supplier.name,
            COALESCE(SUM(p.totalAmount), 0),
            COUNT(p)
        )
        FROM Purchase p
        WHERE p.status = com.pharmacy.entity.PurchaseStatus.RECEIVED
          AND p.purchaseDate BETWEEN :from AND :to
        GROUP BY p.supplier.id, p.supplier.name
        ORDER BY SUM(p.totalAmount) DESC
        """)
    List<SupplierPurchaseReportResponse> findPurchasesBySupplier(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

}
