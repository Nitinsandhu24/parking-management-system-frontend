package com.parking.tenant;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenants", schema = "master")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Tenant {

    @Id
    private String id;            // e.g. "tenant_acme"

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String schemaName;    // PostgreSQL schema: "tenant_acme"

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TenantPlan plan = TenantPlan.BASIC;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    private String contactEmail;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
