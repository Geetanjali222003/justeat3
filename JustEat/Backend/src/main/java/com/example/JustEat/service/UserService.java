package com.example.JustEat.service;

import com.example.JustEat.dto.request.UpdateProfileRequest;
import com.example.JustEat.dto.response.UserProfileResponse;
import com.example.JustEat.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface UserService {
    UserResponse getCurrentUser();
    UserProfileResponse getProfile(UUID userId);
    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
    UserProfileResponse updateProfileImage(UUID userId, MultipartFile image);
}
