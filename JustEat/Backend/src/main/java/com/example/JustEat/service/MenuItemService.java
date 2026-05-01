package com.example.JustEat.service;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.request.UpdateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    MenuItemResponse addMenuItem(UUID restaurantId, CreateMenuItemRequest request, MultipartFile image, UUID userID);
    MenuItemResponse updateMenuItem(UUID restaurantId,Long menuItemId,  UpdateMenuItemRequest request, UUID userId);
    void deleteMenuItem(UUID restaurantId, Long menuItemId, UUID userId);
    List<MenuItemResponse> getMenu(UUID restaurantId);
}
