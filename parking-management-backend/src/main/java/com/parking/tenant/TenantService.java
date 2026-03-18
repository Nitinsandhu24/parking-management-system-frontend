package com.parking.tenant;

import com.parking.config.DataSourceConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final DataSourceConfig dataSourceConfig;

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant findById(String id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + id));
    }

    @Transactional
    public Tenant createTenant(TenantDTOs.CreateTenantRequest request) {
        if (tenantRepository.existsByName(request.name())) {
            throw new RuntimeException("Tenant name already exists: " + request.name());
        }

        String schemaName = "tenant_" + request.name().toLowerCase().replaceAll("[^a-z0-9]", "_");
        String tenantId = schemaName;

        Tenant tenant = Tenant.builder()
                .id(tenantId)
                .name(request.name())
                .schemaName(schemaName)
                .plan(request.plan() != null ? request.plan() : TenantPlan.BASIC)
                .contactEmail(request.contactEmail())
                .build();

        tenantRepository.save(tenant);

        // Provision the new schema and run migrations
        provisionSchema(schemaName);

        log.info("Tenant provisioned: {} (schema: {})", tenant.getName(), schemaName);
        return tenant;
    }

    @Transactional
    public Tenant updatePlan(String tenantId, TenantPlan plan) {
        Tenant tenant = findById(tenantId);
        tenant.setPlan(plan);
        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deactivateTenant(String tenantId) {
        Tenant tenant = findById(tenantId);
        tenant.setActive(false);
        tenantRepository.save(tenant);
    }

    private void provisionSchema(String schemaName) {
        DataSource ds = dataSourceConfig.buildDataSourceForSchema(schemaName);
        Flyway flyway = Flyway.configure()
                .dataSource(ds)
                .schemas(schemaName)
                .locations("classpath:db/migration/tenant")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
        log.info("Schema migrated: {}", schemaName);
    }
}
