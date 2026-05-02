package com.example.JustEat.dto.request;

import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only letters")
    private String firstName;
    
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only letters")
    private String lastName;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phoneNumber;
    
    private Gender gender;
    private Location location;
}

