package com.example.JustEat.controller;

import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;
import com.example.JustEat.dto.request.ResetPasswordWithOtpRequest;
import com.example.JustEat.dto.request.SendOtpRequest;
import com.example.JustEat.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/send-otp")
    public String sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtp(request);
        return "OTP sent successfully";
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return "Registration successful";
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @PostMapping("/send-reset-otp")
    public String sendResetOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendResetOtp(request);
        return "OTP sent successfully";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@Valid @RequestBody ResetPasswordWithOtpRequest request) {
        authService.resetPassword(request);
        return "Password updated";
    }
}
