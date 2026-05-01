package com.example.JustEat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank
    private String token;
    @NotBlank
    @Size(min = 6)
    private String newPassword;
}
