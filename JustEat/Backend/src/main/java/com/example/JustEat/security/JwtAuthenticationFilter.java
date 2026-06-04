package com.example.JustEat.security;

import com.example.JustEat.entity.User;
import com.example.JustEat.repository.UserRepository;
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
import java.util.UUID;

/**
 * JWT authentication filter that intercepts HTTP requests to validate JWT tokens.
 * Extends OncePerRequestFilter to ensure single execution per request.
 * 
 * Flow:
 * 1. Extract JWT token from Authorization header
 * 2. Validate token signature and expiry
 * 3. Extract user information from token
 * 4. Create Spring Security authentication object
 * 5. Set authentication in SecurityContext for downstream filters/controllers
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;
    private final UserRepository userRepository;
    
    /**
     * Main filter method executed for each HTTP request.
     * Validates JWT token and sets up Spring Security authentication if valid.
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Extract Authorization header (format: "Bearer <token>")
        final String header = request.getHeader("Authorization");
        
        // Skip authentication if no Authorization header or invalid format
        if(header == null || !header.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract token (remove "Bearer " prefix - 7 characters)
        String token = header.substring(7);
        
        // Validate token signature and expiry
        if(!jwtUtil.isTokenValid(token)){
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract user ID from token payload
        UUID userId = jwtUtil.extractUserId(token);
        
        // Fetch user from database using the UUID from token
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Build Spring Security UserDetails object with user's credentials and role
        // Note: Username is set to publicId (UUID) for consistent identification across the app
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getPublicId().toString())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        // Create authentication token (credentials are null as JWT already validated)
        UsernamePasswordAuthenticationToken auth = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        
        // Attach request details (IP, session, etc.) to authentication object
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        
        // Set authentication in SecurityContext so controllers/services can access it
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        // Continue filter chain with authenticated user
        filterChain.doFilter(request, response);
    }
}
