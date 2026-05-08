package com.example.JustEat.controller;

import com.example.JustEat.dto.request.UpdateProfileRequest;
import com.example.JustEat.dto.response.UserProfileResponse;
import com.example.JustEat.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {
    
    private final UserService userService;

    // Retrieve profile information for the authenticated user
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile() {
        UUID userId = getCurrentUserId();
        UserProfileResponse profile = userService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    // Update the authenticated user's profile information
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = getCurrentUserId();
        UserProfileResponse profile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(profile);
    }

    // Update profile image for the authenticated user (multipart upload)
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> updateProfileImage(
            @RequestParam("image") MultipartFile image) {
        UUID userId = getCurrentUserId();
        UserProfileResponse profile = userService.updateProfileImage(userId, image);
        return ResponseEntity.ok(profile);
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
    }
}

