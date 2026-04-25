package com.parking.auth;

import com.parking.config.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                chain.doFilter(request, response);
                return;
            }

            final String token        = authHeader.substring(7);
            final String username     = jwtUtil.extractUsername(token);
            final String jwtTenantId  = jwtUtil.extractTenantId(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Priority 1: X-Tenant-ID header (lets Super Admin switch tenants)
                    // Priority 2: tenant from JWT token
                    String headerTenantId = request.getHeader("X-Tenant-ID");

                    if (headerTenantId != null
                            && !headerTenantId.isBlank()
                            && !headerTenantId.equals("master")) {
                        // Use header tenant — Super Admin viewing a specific tenant
                        TenantContext.setTenantId(headerTenantId);
                    } else if (jwtTenantId != null) {
                        // Fall back to JWT tenant
                        TenantContext.setTenantId(jwtTenantId);
                    }
                }
            }

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}