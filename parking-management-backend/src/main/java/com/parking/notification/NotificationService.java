package com.parking.notification;

import com.parking.booking.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmed – Slot " + booking.getSlot().getSlotNumber();
        String body = String.format(
                "Your parking slot %s has been reserved.\n" +
                "Booking ID: %s\n" +
                "Vehicle: %s\n" +
                "From: %s",
                booking.getSlot().getSlotNumber(),
                booking.getId(),
                booking.getVehiclePlate(),
                booking.getStartTime());
        emailService.send("noreply@parkos.com", subject, body);
        log.info("Booking confirmation sent for booking {}", booking.getId());
    }

    @Async
    public void sendCheckoutReminder(Booking booking) {
        String subject = "Reminder: Your parking session is ending soon";
        String body = String.format(
                "Your booking for slot %s ends at %s.\n" +
                "Please complete checkout to avoid extra charges.",
                booking.getSlot().getSlotNumber(),
                booking.getEndTime());
        emailService.send("noreply@parkos.com", subject, body);
    }
}
