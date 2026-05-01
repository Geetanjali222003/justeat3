package com.example.JustEat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {
    private final String SECRET = "1234567890-abcdefghijklmnopqrstuvwxyz";
    private final long EXPIRATION = 1000 * 60 * 60 * 24 ;

    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(UUID userId, String role){
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role",role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }
    public UUID extractUserId(String token){
        return UUID.fromString(getClaims(token).getSubject());
    }
    public String extractRole(String token){
        return getClaims(token).get("role",String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public  boolean isTokenValid(String token){
        try{
            getClaims(token);
            return true;
        }catch(JwtException | IllegalArgumentException e){
            return false;
        }
    }
}
