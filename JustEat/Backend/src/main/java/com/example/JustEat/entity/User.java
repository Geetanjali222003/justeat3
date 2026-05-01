package com.example.JustEat.entity;

import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
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

    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
}
