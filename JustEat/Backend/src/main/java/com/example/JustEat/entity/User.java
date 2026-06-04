package com.example.JustEat.entity;

import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Represents a user account in the system.
 * Users can be customers (placing orders) or owners (managing restaurants).
 * Contains authentication credentials, profile information, and preferences.
 */
@Entity
@Table(name="users")
@Getter
@Setter
public class User extends BaseEntity {
    // Public-facing unique identifier (used in APIs instead of database ID)
    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    // User's email address (used for login and communication)
    @Column(nullable = false, unique = true)
    @Email
    private String email;
    
    // BCrypt-hashed password (never exposed in responses)
    @Column(nullable = false)
    @NotBlank
    @JsonIgnore
    private String passwordHash;
    
    // User role (CUSTOMER or OWNER) - determines access permissions
    @Enumerated(EnumType.STRING)
    @NotNull
    private Role role;

    // User's first name (letters and spaces only)
    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only letters")
    private String firstName;

    // User's last name (letters and spaces only)
    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only letters")
    private String lastName;

    // User's gender
    @Enumerated(EnumType.STRING)
    @NotNull
    private Gender gender;

    // Contact phone number (10 digits)
    @NotNull
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;

    // User's location/city (used for restaurant filtering)
    @Enumerated(EnumType.STRING)
    @NotNull
    private Location location;

    // URL to user's profile image
    @Column(name = "profile_image_url")
    private String profileImageUrl;

    // Public ID from image service (for deletion)
    @Column(name = "profile_image_public_id")
    private String profileImagePublicId;

    // User's food preferences (dietary restrictions, favorite cuisines, etc.)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private UserPreference preference;

    // Auto-generate a public UUID before persisting new user
    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
}
