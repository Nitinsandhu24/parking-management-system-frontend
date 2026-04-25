package com.parking.parking;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "parking_lots")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ParkingLot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private String city;
    private String state;

    private Double latitude;
    private Double longitude;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal pricePerHour;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ParkingFloor> floors = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}