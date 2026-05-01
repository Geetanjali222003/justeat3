package com.example.JustEat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private UUID userId;
    private String location;
}
