package com.parking.parking;

import com.parking.realtime.SlotUpdatePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingLotRepository lotRepository;
    private final ParkingFloorRepository floorRepository;
    private final ParkingSlotRepository slotRepository;
    private final SlotUpdatePublisher slotUpdatePublisher;

    public List<ParkingLot> findAllLots() {
        return lotRepository.findByActiveTrue();
    }

    public ParkingLot findLotById(UUID id) {
        return lotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking lot not found: " + id));
    }

    @Transactional
    public ParkingLot createLot(ParkingDTOs.CreateLotRequest request) {
        ParkingLot lot = ParkingLot.builder()
                .name(request.name())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .pricePerHour(request.pricePerHour())
                .build();
        return lotRepository.save(lot);
    }

    @Transactional
    public ParkingFloor addFloor(UUID lotId, ParkingDTOs.CreateFloorRequest request) {
        ParkingLot lot = findLotById(lotId);
        ParkingFloor floor = ParkingFloor.builder()
                .lot(lot)
                .label(request.label())
                .floorNumber(request.floorNumber())
                .build();
        floor = floorRepository.save(floor);

        String prefix = request.slotPrefix() != null ? request.slotPrefix() : "S";
        for (int i = 1; i <= request.numberOfSlots(); i++) {
            ParkingSlot slot = ParkingSlot.builder()
                    .floor(floor)
                    .slotNumber(String.format("%s-%02d", prefix, i))
                    .build();
            slotRepository.save(slot);
        }
        return floor;
    }

    public List<ParkingFloor> findFloorsByLot(UUID lotId) {
        return floorRepository.findByLotIdOrderByFloorNumber(lotId);
    }

    public List<ParkingSlot> findSlotsByFloor(UUID floorId) {
        return slotRepository.findByFloorId(floorId);
    }

    @Transactional
    public ParkingSlot updateSlotStatus(UUID slotId, SlotStatus status, String tenantId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        slot.setStatus(status);
        slot = slotRepository.save(slot);

        // Broadcast real-time update to all connected clients for this tenant
        slotUpdatePublisher.publish(tenantId, slotId, status);
        return slot;
    }

    public ParkingDTOs.AvailabilityResponse getAvailability(UUID lotId) {
        long total       = slotRepository.countByLotIdAndStatus(lotId, null);
        long available   = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.AVAILABLE);
        long occupied    = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.OCCUPIED);
        long reserved    = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.RESERVED);
        long maintenance = slotRepository.countByLotIdAndStatus(lotId, SlotStatus.MAINTENANCE);

        // total = sum of all statuses
        long computedTotal = available + occupied + reserved + maintenance;

        return new ParkingDTOs.AvailabilityResponse(
                lotId, computedTotal, available, occupied, reserved, maintenance);
    }
}
