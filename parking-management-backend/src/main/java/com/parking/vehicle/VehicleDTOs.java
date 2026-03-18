package com.parking.vehicle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class VehicleDTOs {

    public record EntryRequest(
            @NotNull UUID slotId,
            @NotBlank String plateNumber,
            UUID bookingId
    ) {}

    public record ExitRequest(
            @NotNull UUID slotId,
            @NotBlank String plateNumber,
            UUID bookingId
    ) {}

    public record RegisterVehicleRequest(
            @NotBlank String plateNumber,
            VehicleType vehicleType,
            String make,
            String model,
            String color
    ) {}

    public record VehicleLogResponse(
            UUID id,
            UUID slotId,
            String plateNumber,
            String logType,
            UUID bookingId,
            LocalDateTime eventTime
    ) {
        public static VehicleLogResponse from(VehicleLog log) {
            return new VehicleLogResponse(log.getId(), log.getSlotId(),
                    log.getPlateNumber(), log.getLogType().name(),
                    log.getBookingId(), log.getEventTime());
        }
    }

    public record VehicleResponse(
            UUID id,
            String plateNumber,
            String vehicleType,
            String make,
            String model,
            String color
    ) {
        public static VehicleResponse from(Vehicle v) {
            return new VehicleResponse(v.getId(), v.getPlateNumber(),
                    v.getVehicleType().name(), v.getMake(), v.getModel(), v.getColor());
        }
    }
}
