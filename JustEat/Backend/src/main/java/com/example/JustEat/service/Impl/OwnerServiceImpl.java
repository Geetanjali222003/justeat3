package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.ForbiddenException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.mapper.RestaurantMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.OrderRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.service.OwnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerServiceImpl implements OwnerService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public MenuItemResponse updateSpecialFlag(Long foodId, Boolean isSpecial, UUID userId) {
        MenuItem menuItem = menuItemRepository.findById(foodId)
                .orElseThrow(() -> new NotFoundException("Food item not found"));

        // Verify ownership
        if (!menuItem.getRestaurant().getOwner().getPublicId().equals(userId)) {
            throw new ForbiddenException("Not authorized to modify this item");
        }

        menuItem.setSpecial(Boolean.TRUE.equals(isSpecial));
        MenuItem saved = menuItemRepository.save(menuItem);

        log.info("Special item updated {}", foodId);
        return MenuItemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public MenuItemResponse updateDealFlag(Long foodId, Boolean isDealOfDay, UUID userId) {
        MenuItem menuItem = menuItemRepository.findById(foodId)
                .orElseThrow(() -> new NotFoundException("Food item not found"));

        // Verify ownership
        if (!menuItem.getRestaurant().getOwner().getPublicId().equals(userId)) {
            throw new ForbiddenException("Not authorized to modify this item");
        }

        menuItem.setDealOfDay(Boolean.TRUE.equals(isDealOfDay));
        MenuItem saved = menuItemRepository.save(menuItem);

        log.info("Deal of day updated for item {}", foodId);
        return MenuItemMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getOwnerRestaurants(UUID ownerPublicId) {
        log.info("Fetching restaurants for owner {}", ownerPublicId);
        
        List<Restaurant> restaurants = restaurantRepository.findByOwnerPublicId(ownerPublicId);
        
        if (restaurants == null || restaurants.isEmpty()) {
            log.info("No restaurants found for owner {}", ownerPublicId);
            return Collections.emptyList();
        }
        
        return restaurants.stream()
                .map(RestaurantMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> searchOwnerRestaurants(UUID ownerPublicId, String keyword) {
        log.info("Searching restaurants for owner {} with keyword: {}", ownerPublicId, keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return getOwnerRestaurants(ownerPublicId);
        }
        
        List<Restaurant> restaurants = restaurantRepository.searchByOwnerAndKeyword(ownerPublicId, keyword.trim());
        
        if (restaurants == null || restaurants.isEmpty()) {
            log.info("No restaurants found matching keyword: {}", keyword);
            return Collections.emptyList();
        }
        
        return restaurants.stream()
                .map(RestaurantMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponse getOwnerRestaurantById(UUID ownerPublicId, UUID restaurantPublicId) {
        log.info("Fetching restaurant {} for owner {}", restaurantPublicId, ownerPublicId);
        
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantPublicId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
        
        // Validate ownership
        if (!restaurant.getOwner().getPublicId().equals(ownerPublicId)) {
            throw new ForbiddenException("Not authorized to view this restaurant");
        }
        
        return RestaurantMapper.toResponse(restaurant);
    }

    @Override
    @Transactional
    public void deleteRestaurant(UUID ownerPublicId, UUID restaurantPublicId) {
        log.info("Deleting restaurant {} for owner {}", restaurantPublicId, ownerPublicId);
        
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantPublicId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
        
        // Validate ownership
        if (!restaurant.getOwner().getPublicId().equals(ownerPublicId)) {
            throw new ForbiddenException("Not authorized to delete this restaurant");
        }
        
        // Check if there are any orders for this restaurant
        boolean hasOrders = orderRepository.existsByRestaurant(restaurant);
        if (hasOrders) {
            throw new BadRequestException("Cannot delete restaurant with existing orders. Please contact support for assistance.");
        }
        
        // Remove restaurant from all user preferences
        List<UserPreference> preferences = preferenceRepository.findByFavouriteRestaurantsContaining(restaurant);
        for (UserPreference preference : preferences) {
            preference.getFavouriteRestaurants().remove(restaurant);
            preferenceRepository.save(preference);
        }
        
        // Delete the restaurant (cascade will delete ratings and menu items)
        restaurantRepository.delete(restaurant);
        log.info("Restaurant {} deleted successfully", restaurantPublicId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getRestaurantMenu(UUID ownerPublicId, UUID restaurantPublicId) {
        log.info("Fetching menu for restaurant {} by owner {}", restaurantPublicId, ownerPublicId);
        
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantPublicId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
        
        // Validate ownership
        if (!restaurant.getOwner().getPublicId().equals(ownerPublicId)) {
            throw new ForbiddenException("Not authorized to view this restaurant's menu");
        }
        
        List<MenuItem> menuItems = menuItemRepository.findByRestaurant(restaurant);
        
        if (menuItems == null || menuItems.isEmpty()) {
            log.info("No menu items found for restaurant {}", restaurantPublicId);
            return Collections.emptyList();
        }
        
        return menuItems.stream()
                .map(MenuItemMapper::toResponse)
                .collect(Collectors.toList());
    }
}

