package com.example.JustEat.dto.request;

import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Only letters allowed")
    private String firstName;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$")
    private String lastName;

    @NotNull
    private Gender gender;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;

    @NotNull
    private Location location;

    @NotNull
    private Role role;
}
