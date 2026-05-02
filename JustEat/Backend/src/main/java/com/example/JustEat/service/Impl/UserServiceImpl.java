package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.UpdateProfileRequest;
import com.example.JustEat.dto.response.UserProfileResponse;
import com.example.JustEat.dto.response.UserResponse;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.CloudinaryService;
import com.example.JustEat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    
    @Override
    public UserResponse getCurrentUser() {
        String userIdstr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId =  UUID.fromString(userIdstr);
        User user = userRepository.findByPublicId(userId).orElseThrow(()->new NotFoundException("User not found"));
        return UserResponse.builder()
                .pubicId(user.getPublicId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(Role.valueOf(user.getRole().name()))
                .location(Location.valueOf(user.getLocation().name()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        log.info("Fetching profile for user: {}", userId);
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        return mapToProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        
        User saved = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", userId);
        
        return mapToProfileResponse(saved);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfileImage(UUID userId, MultipartFile image) {
        log.info("Updating profile image for user: {}", userId);
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Delete old image if exists
        if (user.getProfileImagePublicId() != null) {
            try {
                cloudinaryService.deleteImage(user.getProfileImagePublicId());
            } catch (Exception e) {
                log.warn("Failed to delete old profile image: {}", e.getMessage());
            }
        }
        
        // Upload new image
        Map<String, String> uploadResult = cloudinaryService.uploadImage(image, "justeat/profiles");
        user.setProfileImageUrl(uploadResult.get("url"));
        user.setProfileImagePublicId(uploadResult.get("publicId"));
        
        User saved = userRepository.save(user);
        log.info("Profile image updated successfully for user: {}", userId);
        
        return mapToProfileResponse(saved);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .publicId(user.getPublicId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .location(user.getLocation())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
