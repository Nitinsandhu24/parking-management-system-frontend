package com.parking.tenant;

import com.parking.auth.AuthDTOs;
import com.parking.auth.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class TenantController {

    private final TenantService tenantService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TenantDTOs.TenantResponse>> getAll() {
        var tenants = tenantService.findAll().stream()
                .map(TenantDTOs.TenantResponse::from).toList();
        return ResponseEntity.ok(tenants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenantDTOs.TenantResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(TenantDTOs.TenantResponse.from(tenantService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<TenantDTOs.TenantResponse> create(
            @Valid @RequestBody TenantDTOs.CreateTenantRequest request) {
        Tenant tenant = tenantService.createTenant(request);
        return ResponseEntity.status(201).body(TenantDTOs.TenantResponse.from(tenant));
    }

    @PatchMapping("/{id}/plan")
    public ResponseEntity<TenantDTOs.TenantResponse> updatePlan(
            @PathVariable String id,
            @RequestBody TenantDTOs.UpdatePlanRequest request) {
        return ResponseEntity.ok(TenantDTOs.TenantResponse.from(
                tenantService.updatePlan(id, request.plan())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        tenantService.deactivateTenant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<AuthDTOs.UserDTO>> getUsersByTenant(@PathVariable String id) {
        var users = userRepository.findByTenantId(id).stream()
                .map(u -> new AuthDTOs.UserDTO(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getRoles()))
                .toList();
        return ResponseEntity.ok(users);
    }
}