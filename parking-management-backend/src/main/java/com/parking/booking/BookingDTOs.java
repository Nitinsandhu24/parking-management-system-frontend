package com.parking.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingDTOs {

    public record CreateBookingRequest(
            @NotNull UUID slotId,
            @NotBlank String vehiclePlate,
            @NotNull LocalDateTime startTime,
            LocalDateTime endTime,
            String notes
    ) {}

    public record BookingResponse(
            UUID id,
            UUID slotId,
            String slotNumber,
            UUID userId,
            String vehiclePlate,
            String status,
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalDateTime checkedInAt,
            LocalDateTime checkedOutAt,
            LocalDateTime createdAt
    ) {
        public static BookingResponse from(Booking b) {
            return new BookingResponse(
                    b.getId(),
                    b.getSlot().getId(),
                    b.getSlot().getSlotNumber(),
                    b.getUserId(),
                    b.getVehiclePlate(),
                    b.getStatus().name(),
                    b.getStartTime(),
                    b.getEndTime(),
                    b.getCheckedInAt(),
                    b.getCheckedOutAt(),
                    b.getCreatedAt());
        }
    }
}
