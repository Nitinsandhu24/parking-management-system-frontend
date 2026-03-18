package com.parking.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    List<Booking> findBySlotIdAndStatusIn(UUID slotId, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN ('CONFIRMED','CHECKED_IN')")
    long countActiveBookings();

    @Query("SELECT b FROM Booking b WHERE b.startTime BETWEEN :from AND :to")
    List<Booking> findByStartTimeBetween(LocalDateTime from, LocalDateTime to);
}
