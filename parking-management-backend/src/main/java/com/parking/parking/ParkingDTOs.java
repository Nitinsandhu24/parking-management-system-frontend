package com.parking.parking;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ParkingDTOs {

    public record CreateLotRequest(
            @NotBlank String name,
            @NotBlank String address,
            String city,
            String state,
            Double latitude,
            Double longitude,
            BigDecimal pricePerHour
    ) {}

    public record LotResponse(
            UUID id,
            String name,
            String address,
            String city,
            String state,
            Double latitude,
            Double longitude,
            boolean active,
            int totalSlots,
            long availableSlots,
            BigDecimal pricePerHour
    ) {}

    public record FloorResponse(
            UUID id,
            String label,
            Integer floorNumber,
            int totalSlots,
            long availableSlots
    ) {}

    public record SlotResponse(
            UUID id,
            String slotNumber,
            String type,
            String status
    ) {}

    public record AvailabilityResponse(
            UUID lotId,
            long total,
            long available,
            long occupied,
            long reserved,
            long maintenance
    ) {}

    public record UpdateSlotStatusRequest(SlotStatus status) {}

    public record CreateFloorRequest(
            @NotBlank String label,
            int floorNumber,
            int numberOfSlots,
            String slotPrefix
    ) {}
}
