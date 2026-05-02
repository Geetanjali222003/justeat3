package com.example.JustEat.controller;

import com.example.JustEat.dto.request.PreferenceRequest;
import com.example.JustEat.dto.request.RatingRequest;
import com.example.JustEat.dto.response.*;
import com.example.JustEat.enums.Location;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.service.PreferenceService;
import com.example.JustEat.service.RatingService;
import com.example.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final RatingService ratingService;
    private final RestaurantService restaurantService;
    private final PreferenceService preferenceService;
    private final MenuItemRepository menuItemRepository;

    @PostMapping("/ratings")
    public ResponseEntity<String> saveRating(@Valid @RequestBody RatingRequest request) {
        String message = ratingService.saveRating(request);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) Location location) {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(location);
        return ResponseEntity.ok(restaurants);
    }

    // Search restaurants (must be before {publicId} to avoid conflict)
    @GetMapping("/restaurants/search")
    public ResponseEntity<List<RestaurantResponse>> searchRestaurants(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        // Search by name - we'll filter from all open restaurants
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(null)
                .stream()
                .filter(r -> keyword.isEmpty() || 
                        r.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                        (r.getDescription() != null && r.getDescription().toLowerCase().contains(keyword.toLowerCase())))
                .toList();
        return ResponseEntity.ok(restaurants);
    }

    // Get single restaurant by publicId
    @GetMapping("/restaurants/{publicId}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable UUID publicId) {
        RestaurantResponse restaurant = restaurantService.getRestaurant(publicId);
        return ResponseEntity.ok(restaurant);
    }

    // Get menu items for a restaurant
    @GetMapping("/restaurants/{publicId}/menu")
    public ResponseEntity<List<MenuItemResponse>> getRestaurantMenu(@PathVariable UUID publicId) {
        List<MenuItemResponse> menuItems = menuItemRepository
                .findByRestaurant_PublicIdAndIsAvailableTrue(publicId)
                .stream()
                .map(MenuItemMapper::toResponse)
                .toList();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/most-ordered")
    public ResponseEntity<List<MostOrderedItemResponse>> getMostOrderedItems() {
        List<MostOrderedItemResponse> items = ratingService.getMostOrderedItems();
        return ResponseEntity.ok(items);
    }

    // Preferences endpoints
    @PostMapping("/preferences")
    public ResponseEntity<PreferenceResponse> savePreferences(@RequestBody PreferenceRequest request) {
        PreferenceResponse response = preferenceService.savePreferences(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get current user's preferences
    @GetMapping("/preferences")
    public ResponseEntity<PreferenceResponse> getCurrentUserPreferences() {
        UUID userId = getCurrentUserId();
        PreferenceResponse response = preferenceService.getPreferences(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<PreferenceResponse> getPreferences(@PathVariable UUID userId) {
        PreferenceResponse response = preferenceService.getPreferences(userId);
        return ResponseEntity.ok(response);
    }

    // Recommendations endpoint - for current user
    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationResponse> getCurrentUserRecommendations() {
        UUID userId = getCurrentUserId();
        RecommendationResponse response = preferenceService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<RecommendationResponse> getRecommendations(@PathVariable UUID userId) {
        RecommendationResponse response = preferenceService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    // Specials and deals endpoint
    @GetMapping("/specials")
    public ResponseEntity<List<MenuItemResponse>> getSpecialsAndDeals() {
        List<MenuItemResponse> specials = preferenceService.getSpecialsAndDeals();
        return ResponseEntity.ok(specials);
    }

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        return UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
    }
}

