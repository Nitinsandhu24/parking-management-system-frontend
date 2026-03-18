package com.parking.parking;

import com.parking.config.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingService parkingService;

    @GetMapping("/lots")
    public ResponseEntity<List<ParkingDTOs.LotResponse>> getLots() {
        var lots = parkingService.findAllLots().stream()
                .map(this::toLotResponse).toList();
        return ResponseEntity.ok(lots);
    }

    @GetMapping("/lots/{id}")
    public ResponseEntity<ParkingDTOs.LotResponse> getLot(@PathVariable UUID id) {
        return ResponseEntity.ok(toLotResponse(parkingService.findLotById(id)));
    }

    @PostMapping("/lots")
    public ResponseEntity<ParkingDTOs.LotResponse> createLot(
            @Valid @RequestBody ParkingDTOs.CreateLotRequest request) {
        ParkingLot lot = parkingService.createLot(request);
        return ResponseEntity.status(201).body(toLotResponse(lot));
    }

    @GetMapping("/lots/{lotId}/floors")
    public ResponseEntity<List<ParkingDTOs.FloorResponse>> getFloors(@PathVariable UUID lotId) {
        var floors = parkingService.findFloorsByLot(lotId).stream()
                .map(this::toFloorResponse).toList();
        return ResponseEntity.ok(floors);
    }

    @PostMapping("/lots/{lotId}/floors")
    public ResponseEntity<ParkingDTOs.FloorResponse> addFloor(
            @PathVariable UUID lotId,
            @Valid @RequestBody ParkingDTOs.CreateFloorRequest request) {
        ParkingFloor floor = parkingService.addFloor(lotId, request);
        return ResponseEntity.status(201).body(toFloorResponse(floor));
    }

    @GetMapping("/floors/{floorId}/slots")
    public ResponseEntity<List<ParkingDTOs.SlotResponse>> getSlots(@PathVariable UUID floorId) {
        var slots = parkingService.findSlotsByFloor(floorId).stream()
                .map(this::toSlotResponse).toList();
        return ResponseEntity.ok(slots);
    }

    @PatchMapping("/slots/{slotId}/status")
    public ResponseEntity<ParkingDTOs.SlotResponse> updateSlotStatus(
            @PathVariable UUID slotId,
            @RequestBody ParkingDTOs.UpdateSlotStatusRequest request) {
        ParkingSlot slot = parkingService.updateSlotStatus(
                slotId, request.status(), TenantContext.getTenantId());
        return ResponseEntity.ok(toSlotResponse(slot));
    }

    @GetMapping("/lots/{lotId}/availability")
    public ResponseEntity<ParkingDTOs.AvailabilityResponse> getAvailability(@PathVariable UUID lotId) {
        return ResponseEntity.ok(parkingService.getAvailability(lotId));
    }

    private ParkingDTOs.LotResponse toLotResponse(ParkingLot lot) {
        long available = lot.getFloors().stream()
                .flatMap(f -> f.getSlots().stream())
                .filter(s -> s.getStatus() == SlotStatus.AVAILABLE).count();
        int total = lot.getFloors().stream().mapToInt(f -> f.getSlots().size()).sum();
        return new ParkingDTOs.LotResponse(lot.getId(), lot.getName(), lot.getAddress(),
                lot.getCity(), lot.getState(), lot.getLatitude(), lot.getLongitude(),
                lot.isActive(), total, available);
    }

    private ParkingDTOs.FloorResponse toFloorResponse(ParkingFloor floor) {
        long available = floor.getSlots().stream()
                .filter(s -> s.getStatus() == SlotStatus.AVAILABLE).count();
        return new ParkingDTOs.FloorResponse(floor.getId(), floor.getLabel(),
                floor.getFloorNumber(), floor.getSlots().size(), available);
    }

    private ParkingDTOs.SlotResponse toSlotResponse(ParkingSlot slot) {
        return new ParkingDTOs.SlotResponse(slot.getId(), slot.getSlotNumber(),
                slot.getType().name(), slot.getStatus().name());
    }
}
