package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.response.UserResponse;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
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
}
