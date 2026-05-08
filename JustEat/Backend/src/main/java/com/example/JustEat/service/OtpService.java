package com.example.JustEat.service;

public interface OtpService {
    // Generate and send an OTP to the given email (via EmailService)
    void sendOtp(String email);

    // Verify a provided OTP against stored value; returns true when valid
    boolean verifyOtp(String email, String otp);

    // Remove stored OTP for the email (cleanup or after successful verification)
    void deleteOtp(String email);
}

