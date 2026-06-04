package com.example.JustEat.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Central security configuration for the JustEat application.
 * 
 * Responsibilities:
 * - Configure CORS (Cross-Origin Resource Sharing) for frontend access
 * - Set up JWT-based stateless authentication
 * - Define authorization rules (which endpoints require which roles)
 * - Register custom JWT authentication filter
 * - Provide password encoder and authentication manager beans
 * 
 * Security Model:
 * - Stateless sessions (no server-side session storage)
 * - JWT tokens for authentication
 * - Role-based access control (CUSTOMER and OWNER roles)
 * - CSRF disabled (appropriate for stateless REST APIs with JWT)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    // SecurityConfig centralizes web security configuration:
    // - Configures CORS allowed origins/methods/headers used by the frontend
    // - Disables CSRF for stateless JWT-based API
    // - Defines route-based authorization rules (roles/permissions)
    // - Registers JWT authentication filter
    // Keep comments minimal; behavior is configured in beans below.
    private final JwtAuthenticationFilter jwtFilter;

    /**
     * Configure CORS to allow frontend applications to access the API.
     * 
     * Allowed origins include:
     * - Local development servers (localhost:5173, 5174)
     * - Production Firebase hosting (justeatapp-1f8c8.web.app)
     * 
     * Important: allowCredentials(true) requires specific origins (not "*")
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow specific origins (frontend URLs)
        // Note: Cannot use "*" with allowCredentials(true)
        config.setAllowedOriginPatterns(List.of(
                "http://98.92.13.239:5173",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "https://justeatapp-1f8c8.web.app"
        ));
        
        // Allow standard HTTP methods and OPTIONS (for preflight requests)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Allow all headers in requests
        config.setAllowedHeaders(List.of("*"));
        
        // Allow cookies and Authorization header to be sent
        config.setAllowCredentials(true);
        
        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Main security filter chain configuration.
     * Defines how requests are authenticated and authorized.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                // Apply CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Disable CSRF (not needed for stateless JWT authentication)
                .csrf(AbstractHttpConfigurer::disable)
                
                // Stateless session (no server-side session storage)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Define authorization rules for endpoints
                .authorizeHttpRequests(auth->auth
                        // Allow CORS preflight requests through security
                        // OPTIONS requests must pass through for CORS to work
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Public endpoints (no authentication required)
                        .requestMatchers("/auth/**", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**").permitAll()
                        
                        // Profile endpoints (any authenticated user)
                        .requestMatchers("/profile/**").authenticated()
                        
                        // Customer-only endpoints
                        .requestMatchers("/cart/**").hasRole("CUSTOMER")
                        .requestMatchers("/customer/**").hasRole("CUSTOMER")
                        .requestMatchers("/order/place", "/order/history", "/order/reorder/**").hasRole("CUSTOMER")
                        
                        // Owner-only endpoints
                        .requestMatchers("/order/owner", "/order/*/status").hasRole("OWNER")
                        .requestMatchers("/owner/**").hasRole("OWNER")
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                
                // Insert JWT filter before Spring Security's username/password filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * Provide BCrypt password encoder bean.
     * Used for hashing passwords during registration and validating during login.
     */
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Provide authentication manager bean.
     * Required by Spring Security for authentication operations.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws  Exception{
        return config.getAuthenticationManager();
    }
}
