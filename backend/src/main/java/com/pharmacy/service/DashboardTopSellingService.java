
package com.pharmacy.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.TopSellingMedicineResponse;
import com.pharmacy.repository.SaleItemRepository;

@Service
@Transactional(readOnly = true)
public class DashboardTopSellingService {

    private final SaleItemRepository saleItemRepository;

    public DashboardTopSellingService(
            SaleItemRepository saleItemRepository) {
        this.saleItemRepository = saleItemRepository;
    }

    public List<TopSellingMedicineResponse> getTopSellingMedicines() {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(30);

        return saleItemRepository.findTopSellingMedicines(from, to)
                .stream()
                .limit(10)
                .toList();
    }
}
