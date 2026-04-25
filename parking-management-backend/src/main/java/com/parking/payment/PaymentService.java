package com.parking.payment;

import com.parking.booking.Booking;
import com.parking.booking.BookingRepository;
import com.parking.booking.BookingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal HOURLY_RATE = new BigDecimal("50.00"); // ₹50/hr

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public Page<Payment> findAll(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }

    public Payment findById(UUID id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));
    }

    @Transactional
    public Payment initiatePayment(PaymentDTOs.InitiatePaymentRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.NO_SHOW) {
            throw new RuntimeException("Payment cannot be initiated for a cancelled booking");
        }

        paymentRepository.findByBookingId(request.bookingId())
                .ifPresent(p -> { throw new RuntimeException("Payment already exists for this booking"); });

        BigDecimal amount = calculateAmount(booking);

        Payment payment = Payment.builder()
                .bookingId(request.bookingId())
                .amount(amount)
                .method(request.method())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.saveAndFlush(payment);

        // For CASH payments auto-confirm — reload fresh from DB first
        if (request.method() == PaymentMethod.CASH) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            payment = paymentRepository.saveAndFlush(payment);
        }

        return payment;
    }

    @Transactional
    public Payment confirmPayment(UUID paymentId, String transactionId) {
        Payment payment = findById(paymentId);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());   // make sure this line exists
        return paymentRepository.saveAndFlush(payment);
    }

    @Transactional
    public Payment refund(UUID paymentId) {
        Payment payment = findById(paymentId);
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }

    public PaymentDTOs.InvoiceResponse getInvoice(UUID paymentId) {
        Payment payment = findById(paymentId);
        Booking booking = bookingRepository.findById(payment.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return PaymentDTOs.InvoiceResponse.from(payment, booking);
    }

    private BigDecimal calculateAmount(Booking booking) {
        LocalDateTime start = booking.getCheckedInAt() != null
                ? booking.getCheckedInAt()
                : booking.getStartTime();
        LocalDateTime end = booking.getCheckedOutAt() != null
                ? booking.getCheckedOutAt()
                : booking.getEndTime() != null
                ? booking.getEndTime()
                : LocalDateTime.now();
        long minutes = Duration.between(start, end).toMinutes();
        long hours = Math.max(1, (long) Math.ceil(minutes / 60.0));
        return HOURLY_RATE.multiply(BigDecimal.valueOf(hours));
    }
}
