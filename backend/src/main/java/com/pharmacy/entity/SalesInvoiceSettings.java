
package com.pharmacy.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "sales_invoice_settings")
public class SalesInvoiceSettings {

    @Id
    private Long id = 1L;

    @Column(name = "invoice_prefix", nullable = false, length = 20)
    private String invoicePrefix = "INV";

    @Column(name = "default_tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultTaxRate = BigDecimal.ZERO;

    @Column(name = "default_discount_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultDiscountRate = BigDecimal.ZERO;

    @Column(name = "invoice_footer", length = 500)
    private String invoiceFooter = "Thank you for choosing our pharmacy!";

    public SalesInvoiceSettings() {
    }

    public Long getId() {
        return id;
    }

    public String getInvoicePrefix() {
        return invoicePrefix;
    }

    public void setInvoicePrefix(String invoicePrefix) {
        this.invoicePrefix = invoicePrefix;
    }

    public BigDecimal getDefaultTaxRate() {
        return defaultTaxRate;
    }

    public void setDefaultTaxRate(BigDecimal defaultTaxRate) {
        this.defaultTaxRate = defaultTaxRate;
    }

    public BigDecimal getDefaultDiscountRate() {
        return defaultDiscountRate;
    }

    public void setDefaultDiscountRate(BigDecimal defaultDiscountRate) {
        this.defaultDiscountRate = defaultDiscountRate;
    }

    public String getInvoiceFooter() {
        return invoiceFooter;
    }

    public void setInvoiceFooter(String invoiceFooter) {
        this.invoiceFooter = invoiceFooter;
    }
}
