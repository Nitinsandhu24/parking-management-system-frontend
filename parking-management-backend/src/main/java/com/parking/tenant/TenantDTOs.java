package com.parking.tenant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class TenantDTOs {

    public record CreateTenantRequest(
            @NotBlank String name,
            @Email String contactEmail,
            TenantPlan plan
    ) {}

    public record TenantResponse(
            String id,
            String name,
            String schemaName,
            String plan,
            boolean active,
            String contactEmail
    ) {
        public static TenantResponse from(Tenant t) {
            return new TenantResponse(
                    t.getId(), t.getName(), t.getSchemaName(),
                    t.getPlan().name(), t.isActive(), t.getContactEmail());
        }
    }

    public record UpdatePlanRequest(TenantPlan plan) {}
}
