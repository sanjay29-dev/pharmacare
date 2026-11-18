package com.pharmacy.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.DemandResponse;
import com.pharmacy.dto.DemandSummaryResponse;
import com.pharmacy.dto.InventoryResponse;
import com.pharmacy.dto.MedicineSalesSummary;
import com.pharmacy.repository.MedicineRepository;
import com.pharmacy.repository.SaleItemRepository;
import com.pharmacy.service.InventoryService;
import com.pharmacy.util.DemandCalculator;

@Service
@Transactional(readOnly = true)
public class DemandService {

    private final SaleItemRepository saleItemRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryService inventoryService;

    @Value("${pharmacy.demand-window-days:30}")
    private int demandWindowDays;

    @Value("${pharmacy.lead-time-days:5}")
    private int leadTimeDays;

    @Value("${pharmacy.cover-days:30}")
    private int coverDays;

    @Value("${pharmacy.slow-moving-max-qty:5}")
    private int slowMovingMaxQty;

    public DemandService(
            SaleItemRepository saleItemRepository,
            MedicineRepository medicineRepository,
            InventoryService inventoryService) {
        this.saleItemRepository = saleItemRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryService = inventoryService;
    }

    private List<DemandResponse> calculateDemand() {
        if (demandWindowDays <= 0 || leadTimeDays <= 0
                || coverDays <= 0 || slowMovingMaxQty < 0) {
            throw new IllegalStateException(
                    "Demand configuration values are invalid");
        }

        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(demandWindowDays);

        Map<Long, Integer> soldByMedicine = new HashMap<>();

        for (MedicineSalesSummary row :
                saleItemRepository.findMedicineSalesBetween(from, to)) {
            soldByMedicine.put(
                    row.medicineId(),
                    Math.toIntExact(row.soldQty()));
        }

        List<InventoryResponse> inventory = inventoryService.getInventory();
        List<DemandResponse> results = new ArrayList<>();

        for (InventoryResponse item : inventory) {
            int soldQty = soldByMedicine.getOrDefault(item.medicineId(), 0);
            double avgDaily = DemandCalculator.averageDailyDemand(
                    soldQty, demandWindowDays);

            int availableQty = item.availableQty();
            int reorderLevel = item.reorderLevel();

            int reorderPoint = DemandCalculator.reorderPoint(
                    avgDaily, leadTimeDays, reorderLevel);

            boolean recommend = DemandCalculator.shouldReorder(
                    availableQty, soldQty, avgDaily,
                    leadTimeDays, reorderLevel);

            int suggestedQty = recommend
                    ? DemandCalculator.suggestedQuantity(
                            availableQty, avgDaily, coverDays, reorderLevel)
                    : 0;

            int daysRemaining = avgDaily > 0
                    ? (int) Math.floor(availableQty / avgDaily)
                    : -1;

            results.add(new DemandResponse(
                    item.medicineId(),
                    item.medicineName(),
                    soldQty,
                    avgDaily,
                    DemandCalculator.averageMonthlyDemand(
                            soldQty, demandWindowDays),
                    availableQty,
                    reorderLevel,
                    reorderPoint,
                    suggestedQty,
                    daysRemaining,
                    recommend
            ));
        }

        return results;
    }

    public DemandSummaryResponse getSummary() {
        List<DemandResponse> all = calculateDemand();

        return new DemandSummaryResponse(
                demandWindowDays,
                all.size(),
                all.stream().filter(r -> r.soldQty() > 0).count(),
                all.stream().filter(DemandResponse::reorderRecommended).count(),
                all.stream().filter(r -> r.soldQty() > 0).sorted(
                        Comparator.comparingInt(DemandResponse::soldQty)
                                .reversed()).limit(10).count(),
                all.stream().filter(r -> r.availableQty() > 0
                        && r.soldQty() <= slowMovingMaxQty).count()
        );
    }

    public List<DemandResponse> getFastMoving() {
        return calculateDemand().stream()
                .filter(r -> r.soldQty() > 0)
                .sorted(Comparator.comparingInt(DemandResponse::soldQty)
                        .reversed())
                .limit(10)
                .toList();
    }

    public List<DemandResponse> getSlowMoving() {
        return calculateDemand().stream()
                .filter(r -> r.availableQty() > 0
                        && r.soldQty() <= slowMovingMaxQty)
                .sorted(Comparator.comparingInt(DemandResponse::soldQty)
                        .thenComparing(DemandResponse::medicineName))
                .toList();
    }

    public List<DemandResponse> getReorderRecommendations() {
        return calculateDemand().stream()
                .filter(DemandResponse::reorderRecommended)
                .sorted(Comparator.comparingInt(DemandResponse::daysRemaining)
                        .thenComparing(DemandResponse::medicineName))
                .toList();
    }
}