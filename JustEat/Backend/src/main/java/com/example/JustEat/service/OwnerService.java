package com.example.JustEat.service;

import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.RestaurantResponse;

import java.util.List;
import java.util.UUID;

public interface OwnerService {
    MenuItemResponse updateSpecialFlag(Long foodId, Boolean isSpecial, UUID userId);
    MenuItemResponse updateDealFlag(Long foodId, Boolean isDealOfDay, UUID userId);
    
    // Restaurant methods
    List<RestaurantResponse> getOwnerRestaurants(UUID ownerPublicId);
    List<RestaurantResponse> searchOwnerRestaurants(UUID ownerPublicId, String keyword);
    RestaurantResponse getOwnerRestaurantById(UUID ownerPublicId, UUID restaurantPublicId);
    void deleteRestaurant(UUID ownerPublicId, UUID restaurantPublicId);
    
    // Menu methods
    List<MenuItemResponse> getRestaurantMenu(UUID ownerPublicId, UUID restaurantPublicId);
}

