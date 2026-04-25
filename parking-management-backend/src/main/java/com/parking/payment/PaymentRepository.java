package com.parking.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByBookingId(UUID bookingId);
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = com.parking.payment.PaymentStatus.SUCCESS AND p.paidAt >= :since")
    BigDecimal sumSuccessfulPaymentsSince(LocalDateTime since);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
            "WHERE p.status = 'SUCCESS' " +
            "AND (p.paidAt >= :since OR (p.paidAt IS NULL AND p.updatedAt >= :since))")
    BigDecimal sumRevenueToday(LocalDateTime since);
}
