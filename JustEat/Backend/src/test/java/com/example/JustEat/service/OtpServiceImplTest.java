package com.example.JustEat.service;

import com.example.JustEat.service.Impl.OtpServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OtpService Tests")
class OtpServiceImplTest {

    @Mock private RedisTemplate<String, String> redisTemplate;
    @Mock private EmailService emailService;
    @Mock private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private OtpServiceImpl otpService;

    @Test
    @DisplayName("sendOtp - should store OTP in Redis and send email")
    void sendOtp_shouldStoreInRedisAndSendEmail() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        otpService.sendOtp("user@example.com");

        verify(valueOperations).set(eq("OTP:user@example.com"), anyString(), eq(Duration.ofMinutes(5)));
        verify(emailService).sendEmail(eq("user@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("verifyOtp - should return true when OTP matches")
    void verifyOtp_matchingOtp_returnsTrue() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("OTP:user@example.com")).thenReturn("123456");

        boolean result = otpService.verifyOtp("user@example.com", "123456");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("verifyOtp - should return false when OTP does not match")
    void verifyOtp_wrongOtp_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("OTP:user@example.com")).thenReturn("123456");

        boolean result = otpService.verifyOtp("user@example.com", "999999");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("verifyOtp - should return false when OTP is not in Redis")
    void verifyOtp_noOtpInRedis_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("OTP:user@example.com")).thenReturn(null);

        boolean result = otpService.verifyOtp("user@example.com", "123456");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("deleteOtp - should delete key from Redis")
    void deleteOtp_shouldDeleteKey() {
        otpService.deleteOtp("user@example.com");

        verify(redisTemplate).delete("OTP:user@example.com");
    }
}

