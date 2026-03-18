package com.parking.vehicle;

import com.parking.booking.Booking;
import com.parking.booking.BookingRepository;
import com.parking.booking.BookingService;
import com.parking.booking.BookingStatus;
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
public class EntryExitService {

    private final VehicleLogRepository vehicleLogRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Transactional
    public VehicleLog logEntry(VehicleDTOs.EntryRequest request) {
        // Auto check-in matching confirmed booking if exists
        bookingRepository
                .findBySlotIdAndStatusIn(request.slotId(),
                        List.of(BookingStatus.CONFIRMED))
                .stream()
                .filter(b -> b.getVehiclePlate().equalsIgnoreCase(request.plateNumber()))
                .findFirst()
                .ifPresent(b -> bookingService.checkIn(b.getId()));

        VehicleLog log = VehicleLog.builder()
                .slotId(request.slotId())
                .plateNumber(request.plateNumber().toUpperCase())
                .logType(LogType.ENTRY)
                .bookingId(request.bookingId())
                .eventTime(LocalDateTime.now())
                .build();

        return vehicleLogRepository.save(log);
    }

    @Transactional
    public VehicleLog logExit(VehicleDTOs.ExitRequest request) {
        // Auto check-out matching checked-in booking if exists
        bookingRepository
                .findBySlotIdAndStatusIn(request.slotId(),
                        List.of(BookingStatus.CHECKED_IN))
                .stream().findFirst()
                .ifPresent(b -> bookingService.checkOut(b.getId()));

        VehicleLog log = VehicleLog.builder()
                .slotId(request.slotId())
                .plateNumber(request.plateNumber().toUpperCase())
                .logType(LogType.EXIT)
                .bookingId(request.bookingId())
                .eventTime(LocalDateTime.now())
                .build();

        return vehicleLogRepository.save(log);
    }

    public Page<VehicleLog> findAll(Pageable pageable) {
        return vehicleLogRepository.findAllByOrderByEventTimeDesc(pageable);
    }

    public List<VehicleLog> findByPlate(String plateNumber) {
        return vehicleLogRepository.findByPlateNumber(plateNumber.toUpperCase());
    }

    public Vehicle registerVehicle(VehicleDTOs.RegisterVehicleRequest request, UUID userId) {
        if (vehicleRepository.existsByPlateNumber(request.plateNumber())) {
            throw new RuntimeException("Vehicle already registered: " + request.plateNumber());
        }
        Vehicle vehicle = Vehicle.builder()
                .userId(userId)
                .plateNumber(request.plateNumber().toUpperCase())
                .vehicleType(request.vehicleType() != null ? request.vehicleType() : VehicleType.CAR)
                .make(request.make())
                .model(request.model())
                .color(request.color())
                .build();
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> findVehiclesByUser(UUID userId) {
        return vehicleRepository.findByUserId(userId);
    }
}
