package com.parking.vehicle;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicle_logs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class VehicleLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID slotId;

    @Column(nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LogType logType = LogType.ENTRY;

    private UUID bookingId;

    @Column(nullable = false)
    private LocalDateTime eventTime;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
