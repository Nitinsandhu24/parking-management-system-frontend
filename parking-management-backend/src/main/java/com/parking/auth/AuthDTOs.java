package com.parking.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;
import java.util.UUID;

public class AuthDTOs {

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            UserDTO user,
            TenantDTO tenant
    ) {}

    public record UserDTO(
            UUID id,
            String firstName,
            String lastName,
            String email,
            Set<String> roles
    ) {}

    public record TenantDTO(
            String id,
            String name,
            String plan
    ) {}

    public record RegisterRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String tenantId,
            Set<String> roles
    ) {}
}
