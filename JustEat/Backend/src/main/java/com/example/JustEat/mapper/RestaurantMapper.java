package com.example.JustEat.mapper;

import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;

public class RestaurantMapper {
    public static RestaurantResponse toResponse(Restaurant restaurant){
        return RestaurantResponse.builder()
                .publicId(restaurant.getPublicId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .location(restaurant.getLocation())
                .cuisineTypes(restaurant.getCuisineTypes())
                .imageUrl(restaurant.getImageUrl())
                .restaurantStatus(restaurant.getStatus())
                .rating(restaurant.getRating())
                .ratingCount(restaurant.getRatingCount())
                .build();
    }
}
