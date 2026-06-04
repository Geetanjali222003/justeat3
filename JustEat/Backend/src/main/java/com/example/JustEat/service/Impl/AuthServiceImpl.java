package com.example.JustEat.service.Impl;


import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;
import com.example.JustEat.dto.request.ResetPasswordWithOtpRequest;
import com.example.JustEat.dto.request.SendOtpRequest;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.security.JwtUtil;
import com.example.JustEat.service.AuthService;
import com.example.JustEat.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementation of authentication service handling user registration, login, and password reset.
 * Uses OTP verification for secure registration and password reset flows.
 * Passwords are hashed with BCrypt before storage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    @Override
    public void sendOtp(SendOtpRequest request) {
        String email = request.getEmail();
        // Prevent OTP send for already registered emails
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }
        otpService.sendOtp(email);
        log.info("OTP sent for registration: {}", email);
    }

    @Override
    public void register(RegisterRequest req) {
        // Verify OTP before allowing registration
        if (!otpService.verifyOtp(req.getEmail(), req.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        
        // Create new user with hashed password
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());

        // Validate role (only CUSTOMER and OWNER allowed for self-registration)
        if (req.getRole() != Role.CUSTOMER && req.getRole() != Role.OWNER) {
            throw new BadRequestException("Invalid role selection");
        }
        user.setRole(req.getRole());
        user.setLocation(req.getLocation());
        user.setGender(req.getGender());
        user.setPhoneNumber(req.getPhoneNumber());
        userRepository.save(user);
        
        // Clean up OTP after successful registration
        otpService.deleteOtp(req.getEmail());
        log.info("User registered successfully: {}", req.getEmail());
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        // Verify password using BCrypt
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        // Generate JWT token for authenticated user
        String token = jwtUtil.generateToken(user.getPublicId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getPublicId())
                .location(user.getLocation() != null ? user.getLocation().name() : null)
                .build();
    }

    @Override
    public void sendResetOtp(SendOtpRequest request) {
        String email = request.getEmail();
        // Only send reset OTP for existing users
        if (!userRepository.existsByEmail(email)) {
            throw new NotFoundException("Email not found");
        }
        otpService.sendOtp(email);
        log.info("Password reset OTP sent: {}", email);
    }

    @Override
    public void resetPassword(ResetPasswordWithOtpRequest request) {
        // Verify OTP before allowing password reset
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Update password with new hashed value
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Clean up OTP after successful password reset
        otpService.deleteOtp(request.getEmail());
        log.info("Password reset successfully for: {}", request.getEmail());
    }
}
