package com.parking.payment;

import com.parking.booking.Booking;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PaymentDTOs {

    public record InitiatePaymentRequest(
            @NotNull UUID bookingId,
            @NotNull PaymentMethod method
    ) {}

    public record PaymentResponse(
            UUID id,
            UUID bookingId,
            BigDecimal amount,
            String method,
            String status,
            String transactionId,
            LocalDateTime paidAt,
            LocalDateTime createdAt
    ) {
        public static PaymentResponse from(Payment p) {
            return new PaymentResponse(p.getId(), p.getBookingId(), p.getAmount(),
                    p.getMethod().name(), p.getStatus().name(),
                    p.getTransactionId(), p.getPaidAt(), p.getCreatedAt());
        }
    }

    public record InvoiceResponse(
            UUID paymentId,
            UUID bookingId,
            String vehiclePlate,
            String slotNumber,
            LocalDateTime checkedIn,
            LocalDateTime checkedOut,
            BigDecimal amount,
            String method,
            String status,
            LocalDateTime paidAt
    ) {
        public static InvoiceResponse from(Payment p, Booking b) {
            return new InvoiceResponse(
                    p.getId(), b.getId(),
                    b.getVehiclePlate(),
                    b.getSlot().getSlotNumber(),
                    b.getCheckedInAt(), b.getCheckedOutAt(),
                    p.getAmount(), p.getMethod().name(),
                    p.getStatus().name(), p.getPaidAt());
        }
    }
}
