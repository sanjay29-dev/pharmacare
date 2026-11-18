
package com.pharmacy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmacy.entity.InventorySettings;

public interface InventorySettingsRepository
        extends JpaRepository<InventorySettings, Long> {
}
