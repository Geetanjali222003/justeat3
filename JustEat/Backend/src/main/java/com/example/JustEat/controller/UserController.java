package com.example.JustEat.controller;

import com.example.JustEat.dto.response.UserResponse;
import com.example.JustEat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @GetMapping("/me")
    public UserResponse getCurrentUser(){
        return userService.getCurrentUser();
    }
}
