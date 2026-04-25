package com.parking.analytics;

import java.math.BigDecimal;

public class AnalyticsDTOs {

    public record DashboardSummary(
            long activeBookings,
            long vehiclesToday,
            BigDecimal revenueToday,
            boolean paymentGatewayOk,
            long availableSlots,
            long occupiedSlots,
            long reservedSlots,
            long totalLots
    ) {}

    public record OccupancyPoint(String date, double occupancyPercent) {}

    public record RevenuePoint(String date, BigDecimal revenue) {}

    public record PeakHourPoint(String hour, int vehicleCount) {}
}
