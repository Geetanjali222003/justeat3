package com.example.JustEat.controller;

import com.example.JustEat.dto.request.DealFlagRequest;
import com.example.JustEat.dto.request.SpecialFlagRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;

    // ==================== Restaurant Endpoints ====================

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getOwnerRestaurants() {
        UUID userId = getCurrentUserId();
        List<RestaurantResponse> restaurants = ownerService.getOwnerRestaurants(userId);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/restaurants/search")
    public ResponseEntity<List<RestaurantResponse>> searchOwnerRestaurants(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        UUID userId = getCurrentUserId();
        List<RestaurantResponse> restaurants = ownerService.searchOwnerRestaurants(userId, keyword);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getOwnerRestaurantById(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        RestaurantResponse restaurant = ownerService.getOwnerRestaurantById(userId, id);
        return ResponseEntity.ok(restaurant);
    }

    // ==================== Food/Menu Item Endpoints ====================

    @PutMapping("/foods/{id}/special")
    public ResponseEntity<MenuItemResponse> updateSpecialFlag(
            @PathVariable Long id,
            @Valid @RequestBody SpecialFlagRequest request) {
        UUID userId = getCurrentUserId();
        MenuItemResponse response = ownerService.updateSpecialFlag(id, request.getIsSpecial(), userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/foods/{id}/deal")
    public ResponseEntity<MenuItemResponse> updateDealFlag(
            @PathVariable Long id,
            @Valid @RequestBody DealFlagRequest request) {
        UUID userId = getCurrentUserId();
        MenuItemResponse response = ownerService.updateDealFlag(id, request.getIsDealOfDay(), userId);
        return ResponseEntity.ok(response);
    }

    // ==================== Helper Methods ====================

    private UUID getCurrentUserId() {
        return UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
    }
}

