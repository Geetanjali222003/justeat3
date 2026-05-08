package com.example.JustEat.controller;

import com.example.JustEat.dto.request.PreferenceRequest;
import com.example.JustEat.dto.request.RatingRequest;
import com.example.JustEat.dto.response.*;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.enums.Location;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
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
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {


    // Services and repositories used by this controller:
    // - ratingService: handles saving/retrieving ratings and related aggregates
    // - restaurantService: returns restaurant-related DTOs
    // - preferenceService: handles user preferences and recommendations
    // - menuItemRepository: low-level access to menu items (used for filtering)
    // - preferenceRepository: used to fetch stored user preferences
    private final RatingService ratingService;
    private final RestaurantService restaurantService;
    private final PreferenceService preferenceService;
    private final MenuItemRepository menuItemRepository;
    private final UserPreferenceRepository preferenceRepository;

    @PostMapping("/ratings")
    /**
     * Save a customer's rating for a menu item or order.
     * Delegates to RatingService and returns an HTTP 200 with a message.
     */
    public ResponseEntity<String> saveRating(@Valid @RequestBody RatingRequest request) {
        String message = ratingService.saveRating(request);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }

    @GetMapping("/restaurants")
    /**
     * Return list of restaurants, optionally filtered by Location.
     * Uses RestaurantService to build DTO responses.
     */
    public ResponseEntity<List<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) Location location) {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(location);
        return ResponseEntity.ok(restaurants);
    }

    // Search restaurants (must be before {publicId} to avoid conflict)
    @GetMapping("/restaurants/search")
    /**
     * Simple text search over restaurants (name and description).
     * Note: this is an in-memory filter over the service result; for large datasets
     * consider adding a database search/index.
     */
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
    /**
     * Get a single restaurant by its public UUID identifier.
     */
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable UUID publicId) {
        RestaurantResponse restaurant = restaurantService.getRestaurant(publicId);
        return ResponseEntity.ok(restaurant);
    }

    // Get menu items for a restaurant (filtered by user dietary preferences)
    @GetMapping("/restaurants/{publicId}/menu")
    /**
     * Retrieve available menu items for a restaurant. If the current user has
     * stored dietary preferences, the returned list is filtered to match them.
     * If preferences are not available or any error occurs while retrieving them,
     * the full available menu is returned.
     */
    public ResponseEntity<List<MenuItemResponse>> getRestaurantMenu(@PathVariable UUID publicId) {
        List<MenuItem> menuItems = menuItemRepository
                .findByRestaurant_PublicIdAndIsAvailableTrue(publicId);
        
        // Filter by dietary restrictions if user has preferences
        try {
            UUID userId = getCurrentUserId();
            Optional<UserPreference> preferenceOpt = preferenceRepository.findByUserPublicId(userId);
            
            if (preferenceOpt.isPresent()) {
                UserPreference preference = preferenceOpt.get();
                List<DietaryRestriction> dietary = preference.getDietaryRestrictions();
                
                // If user has dietary restrictions, filter menu
                if (dietary != null && !dietary.isEmpty()) {
                    menuItems = menuItems.stream()
                        .filter(item -> dietary.contains(item.getDietaryRestriction()))
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            // If no preferences, show all items
        }
        
        return ResponseEntity.ok(
            menuItems.stream()
                .map(MenuItemMapper::toResponse)
                .toList()
        );
    }

    @GetMapping("/most-ordered")
    /**
     * Returns items most frequently ordered across the platform (for recommendation/insights).
     */
    public ResponseEntity<List<MostOrderedItemResponse>> getMostOrderedItems() {
        List<MostOrderedItemResponse> items = ratingService.getMostOrderedItems();
        return ResponseEntity.ok(items);
    }

    // Preferences endpoints
    @PostMapping("/preferences")
    /**
     * Save or update customer preferences (dietary restrictions, locations, etc.).
     */
    public ResponseEntity<PreferenceResponse> savePreferences(@RequestBody PreferenceRequest request) {
        PreferenceResponse response = preferenceService.savePreferences(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get current user's preferences
    @GetMapping("/preferences")
    /**
     * Get preferences for the currently authenticated user.
     */
    public ResponseEntity<PreferenceResponse> getCurrentUserPreferences() {
        UUID userId = getCurrentUserId();
        PreferenceResponse response = preferenceService.getPreferences(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preferences/{userId}")
    /**
     * Get preferences for a specific user (admin/owner use case or public endpoints).
     */
    public ResponseEntity<PreferenceResponse> getPreferences(@PathVariable UUID userId) {
        PreferenceResponse response = preferenceService.getPreferences(userId);
        return ResponseEntity.ok(response);
    }

    // Recommendations endpoint - for current user
    @GetMapping("/recommendations")
    /**
     * Get personalized recommendations for the currently authenticated user.
     */
    public ResponseEntity<RecommendationResponse> getCurrentUserRecommendations() {
        UUID userId = getCurrentUserId();
        RecommendationResponse response = preferenceService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations/{userId}")
    /**
     * Get recommendations for a specific user (useful for testing or admin views).
     */
    public ResponseEntity<RecommendationResponse> getRecommendations(@PathVariable UUID userId) {
        RecommendationResponse response = preferenceService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }

    // Specials and deals endpoint
    @GetMapping("/specials")
    /**
     * Return current specials and deals across restaurants.
     */
    public ResponseEntity<List<MenuItemResponse>> getSpecialsAndDeals() {
        List<MenuItemResponse> specials = preferenceService.getSpecialsAndDeals();
        return ResponseEntity.ok(specials);
    }

    // Helper method to get current user ID
    /**
     * Helper to obtain the current authenticated user's public UUID from the
     * SecurityContext (stored as the principal's username).
     */
    private UUID getCurrentUserId() {
        return UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
    }
}

