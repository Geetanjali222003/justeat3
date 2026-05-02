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
        // Get current user
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Find existing preference or create new
        UserPreference preference = preferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    UserPreference newPref = new UserPreference();
                    newPref.setUser(user);
                    return newPref;
                });

        // Update preferences
        if (request.getFavouriteCuisines() != null) {
            preference.setFavouriteCuisines(request.getFavouriteCuisines());
        }
        if (request.getDietaryRestrictions() != null) {
            preference.setDietaryRestrictions(request.getDietaryRestrictions());
        }

        // Update favourite restaurants
        if (request.getRestaurantIds() != null && !request.getRestaurantIds().isEmpty()) {
            List<Restaurant> restaurants = restaurantRepository.findByPublicIdIn(request.getRestaurantIds());
            preference.setFavouriteRestaurants(restaurants);
        }

        // Update favourite foods
        if (request.getFoodIds() != null && !request.getFoodIds().isEmpty()) {
            List<MenuItem> foods = menuItemRepository.findByIdIn(request.getFoodIds());
            preference.setFavouriteFoods(foods);
        }

        UserPreference saved = preferenceRepository.save(preference);
        log.info("Preferences saved for user {}", userId);

        return toResponse(saved);
    }

    @Override
    public PreferenceResponse getPreferences(UUID userId) {
        UserPreference preference = preferenceRepository.findByUserPublicId(userId)
                .orElseThrow(() -> new NotFoundException("Preferences not found for user"));
        return toResponse(preference);
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

