package com.example.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class RecommendationResponse {
    private List<RestaurantResponse> recommendedRestaurants;
    private List<MenuItemResponse> recommendedFoods;
}

