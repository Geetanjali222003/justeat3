package com.example.JustEat.service;

import com.example.JustEat.dto.request.LoginRequest;
import com.example.JustEat.dto.request.RegisterRequest;
import com.example.JustEat.dto.request.ResetPasswordWithOtpRequest;
import com.example.JustEat.dto.request.SendOtpRequest;
import com.example.JustEat.dto.response.AuthResponse;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.security.JwtUtil;
import com.example.JustEat.service.Impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private OtpService otpService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setPublicId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPasswordHash("encodedPassword");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setRole(Role.CUSTOMER);
        user.setGender(Gender.MALE);
        user.setPhoneNumber("9876543210");
        user.setLocation(Location.NOIDA);
    }

    // ==================== sendOtp ====================

    @Test
    @DisplayName("sendOtp - should throw if email already registered")
    void sendOtp_emailAlreadyRegistered_throwsBadRequest() {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("test@example.com");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.sendOtp(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    @DisplayName("sendOtp - should call otpService when email is new")
    void sendOtp_newEmail_callsOtpService() {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("new@example.com");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

        authService.sendOtp(req);

        verify(otpService, times(1)).sendOtp("new@example.com");
    }

    // ==================== register ====================

    @Test
    @DisplayName("register - should throw BadRequest if OTP is invalid")
    void register_invalidOtp_throwsBadRequest() {
        RegisterRequest req = buildRegisterRequest("WRONG");

        when(otpService.verifyOtp(req.getEmail(), "WRONG")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    @DisplayName("register - should throw BadRequest if email already exists")
    void register_emailAlreadyExists_throwsBadRequest() {
        RegisterRequest req = buildRegisterRequest("123456");

        when(otpService.verifyOtp(req.getEmail(), "123456")).thenReturn(true);
        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("register - should save user and delete OTP on success")
    void register_validRequest_savesUserAndDeletesOtp() {
        RegisterRequest req = buildRegisterRequest("123456");

        when(otpService.verifyOtp(req.getEmail(), "123456")).thenReturn(true);
        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("hashed");

        authService.register(req);

        verify(userRepository, times(1)).save(any(User.class));
        verify(otpService, times(1)).deleteOtp(req.getEmail());
    }

    // ==================== login ====================

    @Test
    @DisplayName("login - should throw if email not found")
    void login_emailNotFound_throwsBadRequest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("unknown@example.com");
        req.setPassword("password");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    @DisplayName("login - should throw if password does not match")
    void login_wrongPassword_throwsBadRequest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("wrongPass");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    @DisplayName("login - should return token on valid credentials")
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(UUID.class), eq("CUSTOMER"))).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");
    }

    // ==================== sendResetOtp ====================

    @Test
    @DisplayName("sendResetOtp - should throw NotFoundException if email not found")
    void sendResetOtp_emailNotFound_throwsNotFoundException() {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("ghost@example.com");

        when(userRepository.existsByEmail("ghost@example.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.sendResetOtp(req))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("sendResetOtp - should send OTP if email exists")
    void sendResetOtp_emailExists_sendsOtp() {
        SendOtpRequest req = new SendOtpRequest();
        req.setEmail("test@example.com");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        authService.sendResetOtp(req);

        verify(otpService).sendOtp("test@example.com");
    }

    // ==================== resetPassword ====================

    @Test
    @DisplayName("resetPassword - should throw BadRequest if OTP is invalid")
    void resetPassword_invalidOtp_throwsBadRequest() {
        ResetPasswordWithOtpRequest req = new ResetPasswordWithOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("000000");
        req.setNewPassword("newPass");

        when(otpService.verifyOtp("test@example.com", "000000")).thenReturn(false);

        assertThatThrownBy(() -> authService.resetPassword(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    @DisplayName("resetPassword - should update password and delete OTP on success")
    void resetPassword_validOtp_updatesPasswordAndDeletesOtp() {
        ResetPasswordWithOtpRequest req = new ResetPasswordWithOtpRequest();
        req.setEmail("test@example.com");
        req.setOtp("123456");
        req.setNewPassword("newSecurePass");

        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newSecurePass")).thenReturn("newHashed");

        authService.resetPassword(req);

        verify(userRepository).save(user);
        verify(otpService).deleteOtp("test@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("newHashed");
    }

    // ==================== Helpers ====================

    private RegisterRequest buildRegisterRequest(String otp) {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@example.com");
        req.setPassword("password123");
        req.setFirstName("Jane");
        req.setLastName("Doe");
        req.setGender(Gender.FEMALE);
        req.setPhoneNumber("9876543210");
        req.setLocation(Location.NOIDA);
        req.setRole(Role.CUSTOMER);
        req.setOtp(otp);
        return req;
    }
}

