package com.parking.analytics;

import java.math.BigDecimal;

public class AnalyticsDTOs {

    public record DashboardSummary(
            long activeBookings,
            long vehiclesToday,
            BigDecimal revenueToday,
            boolean paymentGatewayOk
    ) {}

    public record OccupancyPoint(String date, double occupancyPercent) {}

    public record RevenuePoint(String date, BigDecimal revenue) {}

    public record PeakHourPoint(String hour, int vehicleCount) {}
}
