package com.pharmacy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmacy.entity.SalesInvoiceSettings;

public interface SalesInvoiceSettingsRepository
        extends JpaRepository<SalesInvoiceSettings, Long> {
}