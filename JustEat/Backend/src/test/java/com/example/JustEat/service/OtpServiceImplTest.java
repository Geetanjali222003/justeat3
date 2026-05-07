package com.example.JustEat.service;

import com.example.JustEat.service.Impl.OtpServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OtpService Tests")
class OtpServiceImplTest {

    @Mock private EmailService emailService;

    private OtpServiceImpl otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpServiceImpl(emailService);
    }

    @Test
    @DisplayName("sendOtp - should store OTP in memory and send email")
    void sendOtp_shouldStoreInMemoryAndSendEmail() {
        otpService.sendOtp("user@example.com");

        verify(emailService).sendEmail(eq("user@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("sendOtp and verifyOtp - should return true when OTP matches")
    void sendOtpAndVerify_matchingOtp_returnsTrue() {
        // Capture the OTP sent in the email
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        
        otpService.sendOtp("user@example.com");
        
        verify(emailService).sendEmail(eq("user@example.com"), anyString(), bodyCaptor.capture());
        
        // Extract OTP from email body (format: "Your OTP is: XXXXXX\n...")
        String emailBody = bodyCaptor.getValue();
        String otp = emailBody.substring(emailBody.indexOf(": ") + 2, emailBody.indexOf("\n"));

        boolean result = otpService.verifyOtp("user@example.com", otp);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("verifyOtp - should return false when OTP does not match")
    void verifyOtp_wrongOtp_returnsFalse() {
        otpService.sendOtp("user@example.com");

        boolean result = otpService.verifyOtp("user@example.com", "000000");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("verifyOtp - should return false when OTP is not stored")
    void verifyOtp_noOtp_returnsFalse() {
        boolean result = otpService.verifyOtp("user@example.com", "123456");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("deleteOtp - should remove OTP from storage")
    void deleteOtp_shouldRemoveOtp() {
        // Capture the OTP
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        otpService.sendOtp("user@example.com");
        verify(emailService).sendEmail(eq("user@example.com"), anyString(), bodyCaptor.capture());
        String emailBody = bodyCaptor.getValue();
        String otp = emailBody.substring(emailBody.indexOf(": ") + 2, emailBody.indexOf("\n"));

        // Delete and verify it's gone
        otpService.deleteOtp("user@example.com");

        boolean result = otpService.verifyOtp("user@example.com", otp);
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("sendOtp - generates 6-digit OTP")
    void sendOtp_generates6DigitOtp() {
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        
        otpService.sendOtp("user@example.com");
        
        verify(emailService).sendEmail(eq("user@example.com"), anyString(), bodyCaptor.capture());
        
        String emailBody = bodyCaptor.getValue();
        String otp = emailBody.substring(emailBody.indexOf(": ") + 2, emailBody.indexOf("\n"));

        assertThat(otp).hasSize(6);
        assertThat(otp).matches("\\d{6}");
    }
}
