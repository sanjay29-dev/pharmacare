
package com.pharmacy.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pharmacy.entity.Sale;
import com.pharmacy.entity.SaleStatus;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Sale> findAllByOrderBySaleDateDesc();

    List<Sale> findByStatusOrderBySaleDateDesc(SaleStatus status);

    List<Sale> findBySaleDateBetweenOrderBySaleDateDesc(
            LocalDateTime from,
            LocalDateTime to);

    @Query("""
        SELECT COALESCE(SUM(s.totalAmount), 0)
        FROM Sale s
        WHERE s.status = :status
          AND s.saleDate >= :from
          AND s.saleDate < :to
        """)
    BigDecimal sumSalesByStatusAndDateRange(
            @Param("status") SaleStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("""
        SELECT COUNT(s)
        FROM Sale s
        WHERE s.status = :status
          AND s.saleDate >= :from
          AND s.saleDate < :to
        """)
    long countSalesByStatusAndDateRange(
            @Param("status") SaleStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
    

    List<Sale> findByStatusAndSaleDateGreaterThanEqualAndSaleDateLessThanOrderBySaleDateDesc(
            SaleStatus status,
            LocalDateTime from,
            LocalDateTime to);

}
