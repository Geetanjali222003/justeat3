package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.request.UpdateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.ForbiddenException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.MenuItemMapper;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.service.CloudinaryService;
import com.example.JustEat.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, MultipartFile image, UUID userID) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));

        if (!restaurant.getOwner().getPublicId().equals(userID)) {
            throw new ForbiddenException("Not authorized");
        }

        // Upload image to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(image, "justeat/menu-items");
        String imageUrl = uploadResult.get("url");
        String publicId = uploadResult.get("publicId");

        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setPrice(request.getPrice());
        item.setDescription(request.getDescription());
        item.setImageUrl(imageUrl);
        item.setImagePublicId(publicId);
        item.setCuisineType(request.getCuisineType());
        item.setDietaryRestriction(request.getDietaryRestriction());
        item.setRestaurant(restaurant);

        item.setSpecial(Boolean.TRUE.equals(request.getIsSpecial()));
        item.setAvailable(true);
        item.setOrderCount(0);

        return MenuItemMapper.toResponse(menuItemRepository.save(item));
    }

    @Override
    public MenuItemResponse updateMenuItem(UUID restaurantId, Long menuItemId, UpdateMenuItemRequest request, UUID userId) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId).orElseThrow(()->new NotFoundException("Restaurant not found"));

        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(()-> new NotFoundException("Menu item not found"));
//        System.out.println("Item Restaurant PublicId: " + menuItem.getRestaurant().getPublicId());
//        System.out.println("Request Restaurant PublicId: " + restaurant.getPublicId());
        if (!restaurant.getOwner().getPublicId().equals(userId)) {
            throw new ForbiddenException("Not authorized");
        }

        if(!menuItem.getRestaurant().getId().equals(restaurant.getId()))throw new BadRequestException("Menu item does not belong to this restaurant ");
        if(request.getName()!=null){
            menuItem.setName(request.getName());
        }
        if(request.getPrice()!=null){
            menuItem.setPrice(request.getPrice());
        }
        if(request.getDescription()!=null){
            menuItem.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            menuItem.setImageUrl(request.getImageUrl());
        }

        if (request.getCuisineType() != null) {
            menuItem.setCuisineType(request.getCuisineType());
        }

        if (request.getDietaryRestriction() != null) {
            menuItem.setDietaryRestriction(request.getDietaryRestriction());
        }

        if (request.getIsSpecial() != null) {
            menuItem.setSpecial(request.getIsSpecial());
        }

        if(request.getIsAvailable()!=null){
            menuItem.setAvailable(request.getIsAvailable());
        }
        return MenuItemMapper.toResponse(menuItemRepository.save(menuItem));
    }

    @Override
    public void deleteMenuItem(UUID restaurantId, Long menuItemId, UUID userId) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId).orElseThrow(()->new NotFoundException("Restaurant not found"));
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(()-> new NotFoundException("Menu Item not found"));
        if(!restaurant.getOwner().getPublicId().equals(userId))throw new ForbiddenException("Not authorized");
        if(!menuItem.getRestaurant().getId().equals(restaurant.getId()))throw new BadRequestException("Menu item does not belong to this restaurant");
        menuItemRepository.delete(menuItem);
    }

    @Override
    public List<MenuItemResponse> getMenu(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findByPublicId(restaurantId)
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));
        return menuItemRepository
                .findByRestaurant_PublicIdAndIsAvailableTrue(restaurantId)
                .stream()
                .map(r -> MenuItemMapper.toResponse(r))
                .toList();
    }
}
