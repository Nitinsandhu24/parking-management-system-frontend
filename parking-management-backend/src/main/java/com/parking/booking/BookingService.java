package com.parking.booking;

import com.parking.notification.NotificationService;
import com.parking.parking.ParkingSlot;
import com.parking.parking.ParkingSlotRepository;
import com.parking.parking.SlotStatus;
import com.parking.realtime.SlotUpdatePublisher;
import com.parking.config.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final SlotUpdatePublisher slotUpdatePublisher;
    private final NotificationService notificationService;

    public Page<Booking> findAll(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }

    public Page<Booking> findByUser(UUID userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable);
    }

    public Booking findById(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    @Transactional
    public Booking createBooking(BookingDTOs.CreateBookingRequest request, UUID userId) {
        ParkingSlot slot = slotRepository.findById(request.slotId())
                .orElseThrow(() -> new RuntimeException("Slot not found: " + request.slotId()));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new RuntimeException("Slot is not available");
        }

        // Check for conflicting bookings
        boolean conflict = !bookingRepository
                .findBySlotIdAndStatusIn(request.slotId(),
                        List.of(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN))
                .isEmpty();
        if (conflict) {
            throw new RuntimeException("Slot already has an active booking");
        }

        slot.setStatus(SlotStatus.RESERVED);
        slotRepository.save(slot);
        slotUpdatePublisher.publish(TenantContext.getTenantId(), slot.getId(), SlotStatus.RESERVED);

        Booking booking = Booking.builder()
                .slot(slot)
                .userId(userId)
                .vehiclePlate(request.vehiclePlate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .status(BookingStatus.CONFIRMED)
                .notes(request.notes())
                .build();

        booking = bookingRepository.save(booking);
        notificationService.sendBookingConfirmation(booking);
        return booking;
    }

    @Transactional
    public Booking checkIn(UUID bookingId) {
        Booking booking = findById(bookingId);
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking cannot be checked in from status: " + booking.getStatus());
        }
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        booking.getSlot().setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(booking.getSlot());
        slotUpdatePublisher.publish(TenantContext.getTenantId(), booking.getSlot().getId(), SlotStatus.OCCUPIED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkOut(UUID bookingId) {
        Booking booking = findById(bookingId);
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Booking is not checked in");
        }
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setCheckedOutAt(LocalDateTime.now());
        booking.getSlot().setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(booking.getSlot());
        slotUpdatePublisher.publish(TenantContext.getTenantId(), booking.getSlot().getId(), SlotStatus.AVAILABLE);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancel(UUID bookingId) {
        Booking booking = findById(bookingId);
        if (booking.getStatus() == BookingStatus.CHECKED_IN ||
            booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new RuntimeException("Cannot cancel a booking that is already checked in or completed");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.getSlot().setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(booking.getSlot());
        slotUpdatePublisher.publish(TenantContext.getTenantId(), booking.getSlot().getId(), SlotStatus.AVAILABLE);
        return bookingRepository.save(booking);
    }
}
