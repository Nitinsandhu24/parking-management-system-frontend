package com.parking.analytics;

import com.parking.booking.BookingRepository;
import com.parking.payment.PaymentRepository;
import com.parking.vehicle.VehicleLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VehicleLogRepository vehicleLogRepository;

    public AnalyticsDTOs.DashboardSummary getDashboardSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long activeBookings = bookingRepository.countActiveBookings();
        long vehiclesToday  = vehicleLogRepository.countEntriesSince(todayStart);
        BigDecimal revenueToday = paymentRepository.sumSuccessfulPaymentsSince(todayStart);

        return new AnalyticsDTOs.DashboardSummary(
                activeBookings,
                vehiclesToday,
                revenueToday,
                true   // paymentGatewayOk — stub; wire to actual health check if needed
        );
    }

    public List<AnalyticsDTOs.OccupancyPoint> getOccupancyTrend(int days) {
        // Returns a daily occupancy percentage stub.
        // Wire to actual slot snapshot table in production.
        return IntStream.range(0, days)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now().minusDays(days - 1 - i);
                    double occupancy = 40 + Math.random() * 50; // stub
                    return new AnalyticsDTOs.OccupancyPoint(date.toString(),
                            Math.round(occupancy * 10.0) / 10.0);
                })
                .toList();
    }

    public List<AnalyticsDTOs.RevenuePoint> getRevenueSummary(int days) {
        return IntStream.range(0, days)
                .mapToObj(i -> {
                    LocalDate date = LocalDate.now().minusDays(days - 1 - i);
                    LocalDateTime from = date.atStartOfDay();
                    LocalDateTime to   = date.atTime(LocalTime.MAX);
                    BigDecimal revenue = paymentRepository.sumSuccessfulPaymentsSince(from);
                    return new AnalyticsDTOs.RevenuePoint(date.toString(), revenue);
                })
                .toList();
    }

    public List<AnalyticsDTOs.PeakHourPoint> getPeakHours() {
        // Stub: replace with actual GROUP BY HOUR query from vehicle_logs
        return IntStream.range(0, 24)
                .mapToObj(hour -> {
                    int count = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)
                            ? 60 + (int)(Math.random() * 40)
                            : (int)(Math.random() * 30);
                    return new AnalyticsDTOs.PeakHourPoint(
                            String.format("%02d:00", hour), count);
                })
                .toList();
    }
}
