package com.pharmacy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pharmacy.entity.PharmacySettings;

public interface PharmacySettingsRepository
        extends JpaRepository<PharmacySettings, Long> {
}