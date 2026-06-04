package com.example.JustEat.service.Impl;

import com.example.JustEat.service.EmailService;
import com.example.JustEat.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of OTP service using in-memory storage (ConcurrentHashMap).
 * Generates and sends 6-digit OTPs via email, validates them, and automatically cleans up expired entries.
 * Note: In-memory storage is suitable for single-instance deployments. For multi-instance/production,
 * consider using Redis or another distributed cache.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private static final String OTP_PREFIX = "OTP:";
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 5; // OTPs expire after 5 minutes

    private final EmailService emailService;

    // In-memory OTP storage: maps email -> OTP entry (OTP value + expiry timestamp)
    // Thread-safe for concurrent access
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    @Override
    public void sendOtp(String email) {
        // Generate a random 6-digit OTP
        String otp = generateOtp();
        String key = OTP_PREFIX + email;
        
        // Store OTP with its expiry time (current time + 5 minutes)
        Instant expiryTime = Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60);
        otpStore.put(key, new OtpEntry(otp, expiryTime));
        log.info("OTP generated for {}", email);
        
        // Send OTP via email
        emailService.sendEmail(email, "Your OTP Code - JustEat", 
                "Your OTP is: " + otp + "\n\nThis OTP is valid for " + OTP_EXPIRY_MINUTES + " minutes.");
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        OtpEntry entry = otpStore.get(key);
        
        if (entry == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }
        
        // Check if OTP has expired
        if (Instant.now().isAfter(entry.expiryTime())) {
            log.warn("OTP expired for email: {}", email);
            otpStore.remove(key);
            return false;
        }
        
        // Verify OTP matches
        boolean isValid = entry.otp().equals(otp);
        log.info("OTP verification for {}: {}", email, isValid ? "SUCCESS" : "FAILED");
        return isValid;
    }

    @Override
    public void deleteOtp(String email) {
        String key = OTP_PREFIX + email;
        otpStore.remove(key);
        log.info("OTP deleted for {}", email);
    }

    // Generate a random 6-digit numeric OTP using SecureRandom
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    // Scheduled task that runs every minute to remove expired OTPs from memory
    // Prevents memory leaks from abandoned/expired OTPs
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredOtps() {
        Instant now = Instant.now();
        otpStore.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiryTime()));
    }

    // Immutable record holding OTP value and its expiry timestamp
    private record OtpEntry(String otp, Instant expiryTime) {}
}
