package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.PreferenceRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.PreferenceResponse;
import com.example.JustEat.dto.response.RecommendationResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.mapper.RestaurantMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreferenceServiceImpl implements PreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    @Transactional
    public PreferenceResponse savePreferences(PreferenceRequest request) {
        try {
            // Get current user
            String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
            UUID userId = UUID.fromString(userIdStr);
            log.info("=== Saving preferences for user: {} ===", userId);
            
            User user = userRepository.findByPublicId(userId)
                    .orElseThrow(() -> new NotFoundException("User not found"));

            log.info("User found: {} (ID: {})", user.getEmail(), user.getId());

            // Find existing preference or create new
            UserPreference preference = preferenceRepository.findByUser(user)
                    .orElseGet(() -> {
                        log.info("Creating new preference for user");
                        UserPreference newPref = new UserPreference();
                        newPref.setUser(user);
                        return preferenceRepository.save(newPref); // Save immediately to get ID
                    });

            log.info("Preference entity ID: {}", preference.getId());

            // Update cuisines
            preference.getFavouriteCuisines().clear();
            if (request.getFavouriteCuisines() != null && !request.getFavouriteCuisines().isEmpty()) {
                log.info("Setting {} favourite cuisines: {}", request.getFavouriteCuisines().size(), request.getFavouriteCuisines());
                preference.getFavouriteCuisines().addAll(request.getFavouriteCuisines());
            }
            
            // Update dietary restrictions
            preference.getDietaryRestrictions().clear();
            if (request.getDietaryRestrictions() != null && !request.getDietaryRestrictions().isEmpty()) {
                log.info("Setting {} dietary restrictions: {}", request.getDietaryRestrictions().size(), request.getDietaryRestrictions());
                preference.getDietaryRestrictions().addAll(request.getDietaryRestrictions());
            }

            // Update favourite restaurants
            preference.getFavouriteRestaurants().clear();
            if (request.getRestaurantIds() != null && !request.getRestaurantIds().isEmpty()) {
                log.info("Looking for {} restaurants with IDs: {}", request.getRestaurantIds().size(), request.getRestaurantIds());
                List<Restaurant> restaurants = restaurantRepository.findByPublicIdIn(request.getRestaurantIds());
                log.info("Found {} restaurants", restaurants.size());
                if (!restaurants.isEmpty()) {
                    preference.getFavouriteRestaurants().addAll(restaurants);
                }
            }

            // Update favourite foods
            preference.getFavouriteFoods().clear();
            if (request.getFoodIds() != null && !request.getFoodIds().isEmpty()) {
                log.info("Looking for {} foods with IDs: {}", request.getFoodIds().size(), request.getFoodIds());
                List<MenuItem> foods = menuItemRepository.findByIdIn(request.getFoodIds());
                log.info("Found {} foods", foods.size());
                if (!foods.isEmpty()) {
                    preference.getFavouriteFoods().addAll(foods);
                }
            }

            // Save and flush to ensure immediate persistence
            UserPreference saved = preferenceRepository.saveAndFlush(preference);
            log.info("=== Preferences saved successfully with ID: {} ===", saved.getId());
            log.info("Cuisines count: {}", saved.getFavouriteCuisines().size());
            log.info("Dietary count: {}", saved.getDietaryRestrictions().size());
            log.info("Restaurants count: {}", saved.getFavouriteRestaurants().size());
            log.info("Foods count: {}", saved.getFavouriteFoods().size());

            return toResponse(saved);
        } catch (Exception e) {
            log.error("Error saving preferences: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save preferences: " + e.getMessage(), e);
        }
    }

    @Override
    public PreferenceResponse getPreferences(UUID userId) {
        Optional<UserPreference> preferenceOpt = preferenceRepository.findByUserPublicId(userId);
        if (preferenceOpt.isEmpty()) {
            // Return empty preferences if none exist
            return PreferenceResponse.builder()
                    .userId(userId)
                    .favouriteCuisines(List.of())
                    .dietaryRestrictions(List.of())
                    .favouriteRestaurants(List.of())
                    .favouriteFoods(List.of())
                    .build();
        }
        return toResponse(preferenceOpt.get());
    }

    @Override
    public RecommendationResponse getRecommendations(UUID userId) {
        // Get user preferences
        Optional<UserPreference> preferenceOpt = preferenceRepository.findByUserPublicId(userId);

        List<RestaurantResponse> recommendedRestaurants = new ArrayList<>();
        List<MenuItemResponse> recommendedFoods = new ArrayList<>();

        if (preferenceOpt.isPresent()) {
            UserPreference preference = preferenceOpt.get();

            // Get cuisines and dietary restrictions
            List<CuisineType> cuisines = preference.getFavouriteCuisines();
            List<DietaryRestriction> dietary = preference.getDietaryRestrictions();

            // Add favourite restaurants first
            if (preference.getFavouriteRestaurants() != null) {
                recommendedRestaurants.addAll(
                        preference.getFavouriteRestaurants().stream()
                                .map(RestaurantMapper::toResponse)
                                .collect(Collectors.toList())
                );
            }

            // Add favourite foods first
            if (preference.getFavouriteFoods() != null) {
                recommendedFoods.addAll(
                        preference.getFavouriteFoods().stream()
                                .map(MenuItemMapper::toResponse)
                                .collect(Collectors.toList())
                );
            }

            // Find matching restaurants by cuisine
            if (cuisines != null && !cuisines.isEmpty()) {
                List<Restaurant> matchingRestaurants = restaurantRepository.findByCuisineTypesIn(cuisines);
                Set<UUID> existingIds = recommendedRestaurants.stream()
                        .map(RestaurantResponse::getPublicId)
                        .collect(Collectors.toSet());

                matchingRestaurants.stream()
                        .filter(r -> !existingIds.contains(r.getPublicId()))
                        .map(RestaurantMapper::toResponse)
                        .forEach(recommendedRestaurants::add);
            }

            // Find matching foods by preferences
            if ((cuisines != null && !cuisines.isEmpty()) || (dietary != null && !dietary.isEmpty())) {
                List<CuisineType> safeCuisines = cuisines != null ? cuisines : Collections.emptyList();
                List<DietaryRestriction> safeDietary = dietary != null ? dietary : Collections.emptyList();

                if (!safeCuisines.isEmpty() || !safeDietary.isEmpty()) {
                    List<MenuItem> matchingFoods = menuItemRepository.findByPreferences(safeCuisines, safeDietary);
                    Set<Long> existingIds = recommendedFoods.stream()
                            .map(MenuItemResponse::getId)
                            .collect(Collectors.toSet());

                    matchingFoods.stream()
                            .filter(f -> !existingIds.contains(f.getId()))
                            .map(MenuItemMapper::toResponse)
                            .forEach(recommendedFoods::add);
                }
            }
        }

        // Limit to 10 each
        return RecommendationResponse.builder()
                .recommendedRestaurants(recommendedRestaurants.stream().limit(10).collect(Collectors.toList()))
                .recommendedFoods(recommendedFoods.stream().limit(10).collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<MenuItemResponse> getSpecialsAndDeals() {
        return menuItemRepository.findSpecialsAndDeals().stream()
                .map(MenuItemMapper::toResponse)
                .collect(Collectors.toList());
    }

    private PreferenceResponse toResponse(UserPreference preference) {
        return PreferenceResponse.builder()
                .id(preference.getId())
                .userId(preference.getUser().getPublicId())
                .favouriteCuisines(preference.getFavouriteCuisines())
                .dietaryRestrictions(preference.getDietaryRestrictions())
                .favouriteRestaurants(
                        preference.getFavouriteRestaurants() != null ?
                                preference.getFavouriteRestaurants().stream()
                                        .map(RestaurantMapper::toResponse)
                                        .collect(Collectors.toList()) :
                                Collections.emptyList()
                )
                .favouriteFoods(
                        preference.getFavouriteFoods() != null ?
                                preference.getFavouriteFoods().stream()
                                        .map(MenuItemMapper::toResponse)
                                        .collect(Collectors.toList()) :
                                Collections.emptyList()
                )
                .build();
    }
}

