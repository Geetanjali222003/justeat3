package com.example.JustEat.dto.response;

import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private UUID publicId;
    private String email;
    private String firstName;
    private String lastName;
    private Gender gender;
    private String phoneNumber;
    private Location location;
    private Role role;
    private String profileImageUrl;
}

