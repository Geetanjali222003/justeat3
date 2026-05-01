package com.example.JustEat.service;

import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
