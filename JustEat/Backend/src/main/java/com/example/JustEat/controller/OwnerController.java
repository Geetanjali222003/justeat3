package com.example.JustEat.controller;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.request.DealFlagRequest;
import com.example.JustEat.dto.request.SpecialFlagRequest;
import com.example.JustEat.dto.request.UpdateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.OrderResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.enums.Location;
import com.example.JustEat.service.MenuItemService;
import com.example.JustEat.service.OrderService;
import com.example.JustEat.service.OwnerService;
import com.example.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;
    private final OrderService orderService;
    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;

    // ==================== Restaurant Endpoints ====================
    // Create restaurant
    @PostMapping(value = "/restaurants", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @RequestParam("name") @NotBlank @Size(min = 2, max = 100) String name,
            @RequestParam("description") @NotBlank @Size(max = 500) String description,
            @RequestParam("location") @NotNull Location location,
            @RequestParam("cuisineTypes") @NotNull List<CuisineType> cuisineTypes,
            @RequestParam(value = "image", required = true) MultipartFile image) {
        
        CreateRestaurantRequest request = CreateRestaurantRequest.builder()
                .name(name)
                .description(description)
                .location(location)
                .cuisineTypes(cuisineTypes)
                .build();
        
        RestaurantResponse response = restaurantService.createRestaurant(request, image);
        return ResponseEntity.ok(response);
    }

    // Get restaurants owned by the current authenticated owner user
    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getOwnerRestaurants() {
        UUID userId = getCurrentUserId();
        List<RestaurantResponse> restaurants = ownerService.getOwnerRestaurants(userId);
        return ResponseEntity.ok(restaurants);
    }

    // Search within restaurants owned by this owner
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

    // Delete a restaurant owned by the current owner
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        ownerService.deleteRestaurant(userId, id);
        return ResponseEntity.noContent().build();
    }

    // Get menu items for a specific restaurant owned by the current owner
    @GetMapping("/restaurants/{id}/menu")
    public ResponseEntity<List<MenuItemResponse>> getRestaurantMenu(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        List<MenuItemResponse> menuItems = ownerService.getRestaurantMenu(userId, id);
        return ResponseEntity.ok(menuItems);
    }

    // Add a menu item to a restaurant (owner must be authenticated)
    @PostMapping(value = "/restaurants/{id}/menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItemResponse> addMenuItem(
            @PathVariable UUID id,
            @RequestParam("name") @NotBlank @Size(min = 2, max = 100) String name,
            @RequestParam("price") @NotNull @DecimalMin(value = "0.0", inclusive = false) Double price,
            @RequestParam("description") @NotBlank @Size(max = 500) String description,
            @RequestParam("cuisineType") @NotNull CuisineType cuisineType,
            @RequestParam("dietaryRestriction") @NotNull DietaryRestriction dietaryRestriction,
            @RequestParam(value = "isSpecial", required = false, defaultValue = "false") Boolean isSpecial,
            @RequestParam(value = "image", required = true) MultipartFile image) {
        
        UUID userId = getCurrentUserId();
        
        CreateMenuItemRequest request = new CreateMenuItemRequest();
        request.setName(name);
        request.setPrice(price);
        request.setDescription(description);
        request.setCuisineType(cuisineType);
        request.setDietaryRestriction(dietaryRestriction);
        request.setIsSpecial(isSpecial);
        
        MenuItemResponse response = menuItemService.addMenuItem(id, request, image, userId);
        return ResponseEntity.ok(response);
    }

    // Update menu item (owner only)
    @PatchMapping("/restaurants/{id}/menu/{menuItemId}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable UUID id,
            @PathVariable Long menuItemId,
            @RequestBody @Valid UpdateMenuItemRequest request) {
        UUID userId = getCurrentUserId();
        MenuItemResponse response = menuItemService.updateMenuItem(id, menuItemId, request, userId);
        return ResponseEntity.ok(response);
    }

    // Delete menu item (owner only)
    @DeleteMapping("/restaurants/{id}/menu/{menuItemId}")
    public ResponseEntity<Void> deleteMenuItem(
            @PathVariable UUID id,
            @PathVariable Long menuItemId) {
        UUID userId = getCurrentUserId();
        menuItemService.deleteMenuItem(id, menuItemId, userId);
        return ResponseEntity.ok().build();
    }

    // ==================== Order Endpoints ====================

    // Get all orders for restaurants owned by the current owner
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOwnerOrders() {
        List<OrderResponse> orders = orderService.getOwnerOrders();
        return ResponseEntity.ok(orders);
    }

    // ==================== Food/Menu Item Endpoints ====================

    @PutMapping("/foods/{id}/special")
    // Toggle 'special' flag on a menu item
    public ResponseEntity<MenuItemResponse> updateSpecialFlag(
            @PathVariable Long id,
            @Valid @RequestBody SpecialFlagRequest request) {
        UUID userId = getCurrentUserId();
        MenuItemResponse response = ownerService.updateSpecialFlag(id, request.getIsSpecial(), userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/foods/{id}/deal")
    // Toggle 'deal of the day' flag on a menu item
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
