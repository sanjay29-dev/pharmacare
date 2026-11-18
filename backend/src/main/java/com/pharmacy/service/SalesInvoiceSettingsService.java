
package com.pharmacy.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.SalesInvoiceSettingsRequest;
import com.pharmacy.entity.SalesInvoiceSettings;
import com.pharmacy.repository.SalesInvoiceSettingsRepository;

@Service
public class SalesInvoiceSettingsService {

    private final SalesInvoiceSettingsRepository repository;

    public SalesInvoiceSettingsService(
            SalesInvoiceSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public SalesInvoiceSettings getSettings() {
        return repository.findById(1L)
                .orElseGet(SalesInvoiceSettings::new);
    }

    @Transactional
    public SalesInvoiceSettings updateSettings(
            SalesInvoiceSettingsRequest request) {

        SalesInvoiceSettings settings = repository.findById(1L)
                .orElseGet(SalesInvoiceSettings::new);

        settings.setInvoicePrefix(request.invoicePrefix().trim());
        settings.setDefaultTaxRate(
                request.defaultTaxRate() != null
                        ? request.defaultTaxRate()
                        : BigDecimal.ZERO);
        settings.setDefaultDiscountRate(
                request.defaultDiscountRate() != null
                        ? request.defaultDiscountRate()
                        : BigDecimal.ZERO);
        settings.setInvoiceFooter(
                request.invoiceFooter() != null
                        ? request.invoiceFooter().trim()
                        : "");

        return repository.save(settings);
    }
}
