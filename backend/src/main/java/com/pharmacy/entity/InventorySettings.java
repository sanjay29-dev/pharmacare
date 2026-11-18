
package com.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_settings")
public class InventorySettings {

    @Id
    private Long id = 1L;

    @Column(name = "low_stock_alert_enabled", nullable = false)
    private boolean lowStockAlertEnabled = true;

    @Column(name = "expiry_alert_enabled", nullable = false)
    private boolean expiryAlertEnabled = true;

    @Column(name = "expiry_alert_days", nullable = false)
    private Integer expiryAlertDays = 30;

    @Column(name = "default_reorder_level", nullable = false)
    private Integer defaultReorderLevel = 10;

    public InventorySettings() {
    }

    public Long getId() {
        return id;
    }

    public boolean isLowStockAlertEnabled() {
        return lowStockAlertEnabled;
    }

    public void setLowStockAlertEnabled(boolean lowStockAlertEnabled) {
        this.lowStockAlertEnabled = lowStockAlertEnabled;
    }

    public boolean isExpiryAlertEnabled() {
        return expiryAlertEnabled;
    }

    public void setExpiryAlertEnabled(boolean expiryAlertEnabled) {
        this.expiryAlertEnabled = expiryAlertEnabled;
    }

    public Integer getExpiryAlertDays() {
        return expiryAlertDays;
    }

    public void setExpiryAlertDays(Integer expiryAlertDays) {
        this.expiryAlertDays = expiryAlertDays;
    }

    public Integer getDefaultReorderLevel() {
        return defaultReorderLevel;
    }

    public void setDefaultReorderLevel(Integer defaultReorderLevel) {
        this.defaultReorderLevel = defaultReorderLevel;
    }
}
