package com.example.JustEat.security;


import com.example.JustEat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom implementation of Spring Security's UserDetailsService.
 * Loads user details from the database by email for authentication.
 * 
 * This service is used by Spring Security during traditional username/password
 * authentication flows (not directly used in JWT authentication, but required
 * by Spring Security configuration).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    
    /**
     * Load user by email address (username in Spring Security terms).
     * Called by Spring Security authentication mechanisms.
     * 
     * @param email - User's email address (used as username)
     * @return UserDetails object containing user credentials and authorities
     * @throws UsernameNotFoundException if user with given email doesn't exist
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Fetch user from database
        com.example.JustEat.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Convert our User entity to Spring Security's UserDetails
        // Username is set to email, password is the BCrypt hash, role determines authorities
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())  // Automatically prefixed with "ROLE_" by Spring
                .build();
    }
}
