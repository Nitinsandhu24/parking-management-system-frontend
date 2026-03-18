package com.parking.auth;

import com.parking.tenant.Tenant;
import com.parking.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthDTOs.LoginResponse login(AuthDTOs.LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("this is password checker " + passwordEncoder.matches(request.password(), user.getPasswordHash()) +  "   " + request.password()+"     "+user.getPasswordHash());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        Tenant tenant = tenantRepository.findById(user.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, tenant.getId());

        return new AuthDTOs.LoginResponse(
                token,
                new AuthDTOs.UserDTO(user.getId(), user.getFirstName(), user.getLastName(),
                        user.getEmail(), user.getRoles()),
                new AuthDTOs.TenantDTO(
                        tenant.getId(),
                        tenant.getName(),
                        tenant.getPlan().name()
                )

        );
    }

    public User register(AuthDTOs.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .tenantId(request.tenantId())
                .roles(request.roles() != null ? request.roles() : Set.of("ROLE_OPERATOR"))
                .build();
        return userRepository.save(user);
    }


    public AuthDTOs.LoginResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered.");
        }
        // Default tenant for self-signup — assign to demo tenant or create logic as needed
        String defaultTenantId = "tenant_demo";
        Tenant tenant = tenantRepository.findById(defaultTenantId)
                .orElseThrow(() -> new RuntimeException("Default tenant not configured."));

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .tenantId(defaultTenantId)
                .roles(java.util.Set.of("ROLE_USER"))
                .build();
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, defaultTenantId);

        return new AuthDTOs.LoginResponse(
                token,
                new AuthDTOs.UserDTO(user.getId(), user.getFirstName(), user.getLastName(),
                        user.getEmail(), user.getRoles()),
                new AuthDTOs.TenantDTO(
                        tenant.getId(),
                        tenant.getName(),
                        tenant.getPlan().name()
                )

        );
    }
}