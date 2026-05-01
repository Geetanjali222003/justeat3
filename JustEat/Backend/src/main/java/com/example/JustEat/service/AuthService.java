package com.example.JustEat.service;

import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;
import com.example.JustEat.dto.request.ResetPasswordWithOtpRequest;
import com.example.JustEat.dto.request.SendOtpRequest;

public interface AuthService {
    void sendOtp(SendOtpRequest request);
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void sendResetOtp(SendOtpRequest request);
    void resetPassword(ResetPasswordWithOtpRequest request);
}
