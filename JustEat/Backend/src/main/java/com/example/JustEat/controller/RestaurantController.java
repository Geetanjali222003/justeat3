package com.example.JustEat.controller;

import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;
    // Create a new restaurant (owner-only). Multipart form allows image upload.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public RestaurantResponse createRestaurant(
            @RequestParam("name") @NotBlank @Size(min = 2, max = 100) String name,
            @RequestParam("description") @NotBlank @Size(max = 500) String description,
            @RequestParam("location") @NotNull Location location,
            @RequestParam("cuisineTypes") @NotNull List<CuisineType> cuisineTypes,
            @RequestParam(value = "image", required = true) MultipartFile image) {
        
        CreateRestaurantRequest request = CreateRestaurantRequest.builder()
                .name(name)
                .description(description)
                .location(location)
                .cuisineTypes(cuisineTypes)
                .build();
        
        return restaurantService.createRestaurant(request, image);
    }

    // List restaurants, optionally filtered by location
    @GetMapping
    public List<RestaurantResponse> getRestaurants(@RequestParam(required = false)Location location){
        return restaurantService.getAllRestaurants(location);
    }

    // Get a single restaurant by its public UUID
    @GetMapping("/{publicId}")
    public RestaurantResponse getRestaurants(@PathVariable UUID publicId){
        return restaurantService.getRestaurant(publicId);
    }

    // List restaurants owned by the current authenticated owner
    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    public List<RestaurantResponse> getMyRestaurants(){
        return restaurantService.getMyRestaurants();
    }
}
