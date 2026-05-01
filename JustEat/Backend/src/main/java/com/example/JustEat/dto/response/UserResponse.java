package com.example.JustEat.dto.response;

import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class UserResponse {
    private UUID pubicId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Location location;
}
