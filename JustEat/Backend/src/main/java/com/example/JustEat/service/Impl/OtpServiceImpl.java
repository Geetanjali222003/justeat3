package com.example.JustEat.service.Impl;

import com.example.JustEat.service.EmailService;
import com.example.JustEat.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private static final String OTP_PREFIX = "OTP:";
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 5;

    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;

    @Override
    public void sendOtp(String email) {
        String otp = generateOtp();
        String key = OTP_PREFIX + email;
        
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(OTP_EXPIRY_MINUTES));
        log.info("OTP generated for {}", email);
        
        emailService.sendEmail(email, "Your OTP Code - JustEat", 
                "Your OTP is: " + otp + "\n\nThis OTP is valid for " + OTP_EXPIRY_MINUTES + " minutes.");
    }

    @Override
    public boolean verifyOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        String storedOtp = redisTemplate.opsForValue().get(key);
        
        if (storedOtp == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }
        
        boolean isValid = storedOtp.equals(otp);
        log.info("OTP verification for {}: {}", email, isValid ? "SUCCESS" : "FAILED");
        return isValid;
    }

    @Override
    public void deleteOtp(String email) {
        String key = OTP_PREFIX + email;
        redisTemplate.delete(key);
        log.info("OTP deleted for {}", email);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}

