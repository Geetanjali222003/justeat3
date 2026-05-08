package com.example.JustEat.service;

import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;
import com.example.JustEat.dto.request.ResetPasswordWithOtpRequest;
import com.example.JustEat.dto.request.SendOtpRequest;

public interface AuthService {
    // Send OTP used in registration/login flows
    void sendOtp(SendOtpRequest request);

    // Register new user account
    void register(RegisterRequest request);

    // Authenticate user and return auth response (tokens/profile)
    AuthResponse login(LoginRequest request);

    // Send OTP for password reset
    void sendResetOtp(SendOtpRequest request);

    // Reset password using a previously sent OTP
    void resetPassword(ResetPasswordWithOtpRequest request);
}
