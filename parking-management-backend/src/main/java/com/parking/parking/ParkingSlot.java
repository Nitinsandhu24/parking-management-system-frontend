package com.parking.parking;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "parking_slots")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private ParkingFloor floor;

    @Column(nullable = false)
    private String slotNumber;      // e.g. "A-01", "B-12"

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SlotType type = SlotType.STANDARD;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SlotStatus status = SlotStatus.AVAILABLE;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
