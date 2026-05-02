package com.example.JustEat.dto.response;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class PreferenceResponse {
    private Long id;
    private UUID userId;
    private List<CuisineType> favouriteCuisines;
    private List<DietaryRestriction> dietaryRestrictions;
    private List<RestaurantResponse> favouriteRestaurants;
    private List<MenuItemResponse> favouriteFoods;
}

