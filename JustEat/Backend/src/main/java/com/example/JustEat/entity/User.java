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

@Entity
@Table(name="users")
@Getter
@Setter
public class User extends BaseEntity {
    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(nullable = false, unique = true)
    @Email
    private String email;
    
    @Column(nullable = false)
    @NotBlank
    @JsonIgnore
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @NotNull
    private Role role;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only letters")
    private String firstName;
    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only letters")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Gender gender;

    @NotNull
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Location location;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "profile_image_public_id")
    private String profileImagePublicId;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private UserPreference preference;

    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
}
