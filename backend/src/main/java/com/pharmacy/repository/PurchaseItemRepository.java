package com.pharmacy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmacy.entity.PurchaseItem;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    List<PurchaseItem> findByPurchaseIdOrderByIdAsc(Long purchaseId);

    List<PurchaseItem> findByMedicineIdOrderByIdDesc(Long medicineId);

    List<PurchaseItem> findByBatchIdOrderByIdDesc(Long batchId);
}