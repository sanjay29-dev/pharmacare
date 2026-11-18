package com.pharmacy.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.pharmacy.dto.TopSellingMedicineResponse;
import com.pharmacy.dto.MedicineSalesSummary;
import com.pharmacy.entity.SaleItem;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

	@Query("""
			SELECT new com.pharmacy.dto.MedicineSalesSummary(
			    si.medicine.id,
			    SUM(si.quantity)
			)
			FROM SaleItem si
			JOIN si.sale s
			WHERE s.saleDate >= :from
			  AND s.saleDate < :to
			  AND s.status = com.pharmacy.entity.SaleStatus.COMPLETED
			GROUP BY si.medicine.id
			""")
	List<MedicineSalesSummary> findMedicineSalesBetween(@Param("from") LocalDateTime from,
			@Param("to") LocalDateTime to);

	List<SaleItem> findBySaleIdOrderByIdAsc(Long saleId);

	@Query("""
			SELECT new com.pharmacy.dto.TopSellingMedicineResponse(
			    si.medicine.id,
			    si.medicine.name,
			    SUM(si.quantity)
			)
			FROM SaleItem si
			JOIN si.sale s
			WHERE s.status = com.pharmacy.entity.SaleStatus.COMPLETED
			  AND s.saleDate >= :from
			  AND s.saleDate < :to
			GROUP BY si.medicine.id, si.medicine.name
			ORDER BY SUM(si.quantity) DESC
			""")
	List<TopSellingMedicineResponse> findTopSellingMedicines(@Param("from") LocalDateTime from,
			@Param("to") LocalDateTime to);

}