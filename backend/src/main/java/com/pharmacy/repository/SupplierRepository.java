package com.pharmacy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pharmacy.entity.RecordStatus;
import com.pharmacy.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Supplier> findByNameContainingIgnoreCase(String name);

    List<Supplier> findByStatus(RecordStatus status);

    List<Supplier> findAllByOrderByNameAsc();
}