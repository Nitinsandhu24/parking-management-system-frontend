package com.parking.parking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, UUID> {
    long countByStatus(SlotStatus status);
    List<ParkingSlot> findByFloorId(UUID floorId);
    List<ParkingSlot> findByFloorIdAndStatus(UUID floorId, SlotStatus status);

    @Query("SELECT COUNT(s) FROM ParkingSlot s JOIN s.floor f WHERE f.lot.id = :lotId AND s.status = :status")
    long countByLotIdAndStatus(UUID lotId, SlotStatus status);
}
