package com.example.JustEat.mapper;

import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.entity.MenuItem;

public class MenuItemMapper {
    // Map MenuItem entity to MenuItemResponse DTO
    // Note: we defensively handle a possible null restaurant reference when reading its name
    public static MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .cuisineType(item.getCuisineType())
                .dietaryRestriction(item.getDietaryRestriction())
                .available(item.isAvailable())
                .isSpecial(item.isSpecial())
                .isDealOfDay(item.isDealOfDay())
                .restaurantName(item.getRestaurant() != null ? item.getRestaurant().getName() : null)
                .build();
    }
}
