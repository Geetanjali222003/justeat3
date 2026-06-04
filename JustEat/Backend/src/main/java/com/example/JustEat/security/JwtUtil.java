package com.example.JustEat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

/**
 * Utility class for JWT (JSON Web Token) operations.
 * Handles token generation, validation, and claims extraction.
 * 
 * Uses HMAC-SHA algorithm for signing tokens with a secret key.
 * Tokens expire after 24 hours by default.
 * 
 * Security Note: In production, the SECRET should be externalized to environment
 * variables or a secure configuration service (not hardcoded).
 */
@Component
public class JwtUtil {
    // Secret key for signing JWT tokens (should be externalized in production)
    private final String SECRET = "1234567890-abcdefghijklmnopqrstuvwxyz";
    
    // Token expiration time: 24 hours in milliseconds (1000ms * 60s * 60m * 24h)
    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    /**
     * Generate SecretKey from the SECRET string for HMAC signing.
     * Called internally by token generation and validation methods.
     */
    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    /**
     * Generate a JWT token for an authenticated user.
     * 
     * @param userId - User's public UUID (used as token subject)
     * @param role - User's role (CUSTOMER or OWNER) stored as a claim
     * @return Signed JWT token string
     */
    public String generateToken(UUID userId, String role){
        return Jwts.builder()
                .subject(userId.toString())           // User identifier (sub claim)
                .claim("role", role)                   // Custom claim for user role
                .issuedAt(new Date())                  // Token creation time (iat)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION)) // Expiry time (exp)
                .signWith(getSigningKey())            // Sign with HMAC-SHA
                .compact();                            // Build and serialize token
    }
    
    /**
     * Extract user ID (UUID) from token's subject claim.
     * 
     * @param token - JWT token string
     * @return User's public UUID
     */
    public UUID extractUserId(String token){

        return UUID.fromString(getClaims(token).getSubject());
    }
    
    /**
     * Extract user role from token's custom "role" claim.
     * 
     * @param token - JWT token string
     * @return User's role (e.g., "CUSTOMER" or "OWNER")
     */
    public String extractRole(String token){

        return getClaims(token).get("role", String.class);
    }

    /**
     * Parse and validate token, then extract all claims.
     * Verifies signature and checks expiration.
     * 
     * @param token - JWT token string
     * @return Claims object containing all token data
     * @throws JwtException if token is invalid or expired
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())          // Verify signature with secret key
                .build()
                .parseSignedClaims(token)             // Parse and validate token
                .getPayload();                         // Extract claims payload
    }
    
    /**
     * Validate JWT token by checking signature and expiration.
     * 
     * @param token - JWT token string
     * @return true if token is valid and not expired, false otherwise
     */
    public boolean isTokenValid(String token){
        try{
            getClaims(token);  // If parsing succeeds, token is valid
            return true;
        } catch(JwtException | IllegalArgumentException e){
            // Token is invalid, expired, or malformed
            return false;
        }
    }
}
