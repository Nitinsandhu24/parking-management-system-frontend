package com.parking.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDTOs.DashboardSummary> getDashboard() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/occupancy")
    public ResponseEntity<List<AnalyticsDTOs.OccupancyPoint>> getOccupancy(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getOccupancyTrend(days));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<AnalyticsDTOs.RevenuePoint>> getRevenue(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getRevenueSummary(days));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<AnalyticsDTOs.PeakHourPoint>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakHours());
    }
}
