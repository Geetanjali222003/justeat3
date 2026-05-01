package com.example.JustEat.controller;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.request.UpdateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.service.MenuItemService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuItemController {
    private final MenuItemService menuItemService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public MenuItemResponse addMenuItem(
            @PathVariable UUID restaurantId,
            @RequestParam("name") @NotBlank @Size(min = 2, max = 100) String name,
            @RequestParam("price") @NotNull @DecimalMin(value = "0.0", inclusive = false) Double price,
            @RequestParam("description") @NotBlank @Size(max = 500) String description,
            @RequestParam("cuisineType") @NotNull CuisineType cuisineType,
            @RequestParam("dietaryRestriction") @NotNull DietaryRestriction dietaryRestriction,
            @RequestParam(value = "isSpecial", required = false, defaultValue = "false") Boolean isSpecial,
            @RequestParam(value = "image", required = true) MultipartFile image) {
        
        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
        
        CreateMenuItemRequest request = new CreateMenuItemRequest();
        request.setName(name);
        request.setPrice(price);
        request.setDescription(description);
        request.setCuisineType(cuisineType);
        request.setDietaryRestriction(dietaryRestriction);
        request.setIsSpecial(isSpecial);
        
        return menuItemService.addMenuItem(restaurantId, request, image, userId);
    }

    @GetMapping
    public List<MenuItemResponse> getMenu(@PathVariable UUID restaurantId){
        return menuItemService.getMenu(restaurantId);
    }

    @PatchMapping("/{menuItemId}")
    @PreAuthorize("hasRole('OWNER')")
    public MenuItemResponse updateMenuItem(@PathVariable UUID restaurantId, @PathVariable Long menuItemId, @RequestBody @Valid UpdateMenuItemRequest request){
        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
        return menuItemService.updateMenuItem(restaurantId, menuItemId, request, userId);
    }

    @DeleteMapping("/{menuItemId}")
    @PreAuthorize("hasRole('OWNER')")
    public void deleteMenuItem(@PathVariable UUID restaurantId, @PathVariable Long menuItemId ){
        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );
        menuItemService.deleteMenuItem(restaurantId,menuItemId,userId);
    }
}
