package com.parking.vehicle;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface VehicleLogRepository extends JpaRepository<VehicleLog, UUID> {
    Page<VehicleLog> findAllByOrderByEventTimeDesc(Pageable pageable);
    List<VehicleLog> findByPlateNumber(String plateNumber);

    @Query("SELECT COUNT(v) FROM VehicleLog v WHERE v.eventTime >= :since AND v.logType = 'ENTRY'")
    long countEntriesSince(LocalDateTime since);
}
