package com.example.JustEat.service;

import com.example.JustEat.dto.request.CreateMenuItemRequest;
import com.example.JustEat.dto.request.UpdateMenuItemRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.ForbiddenException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.CartItemRepository;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.OrderItemRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.service.Impl.MenuItemServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MenuItemService Tests")
class MenuItemServiceImplTest {

    @Mock private RestaurantRepository restaurantRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserPreferenceRepository preferenceRepository;
    @Mock private CloudinaryService cloudinaryService;

    @InjectMocks
    private MenuItemServiceImpl menuItemService;

    private User owner;
    private Restaurant restaurant;
    private MenuItem menuItem;
    private UUID ownerId;
    private UUID restaurantId;

    @BeforeEach
    void setUp() {
        ownerId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();

        owner = new User();
        owner.setId(1L);
        owner.setPublicId(ownerId);
        owner.setRole(Role.OWNER);
        owner.setLocation(Location.NOIDA);

        restaurant = new Restaurant();
        restaurant.setId(1L);
        restaurant.setPublicId(restaurantId);
        restaurant.setName("Test Restaurant");
        restaurant.setOwner(owner);
        restaurant.setMenuItems(new ArrayList<>());
        restaurant.setRatings(new ArrayList<>());

        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Biryani");
        menuItem.setPrice(15.0);
        menuItem.setDescription("Spicy rice dish");
        menuItem.setImageUrl("http://img.url/biryani.jpg");
        menuItem.setRestaurant(restaurant);
        menuItem.setCuisineType(CuisineType.INDIAN);
        menuItem.setDietaryRestriction(DietaryRestriction.NON_VEG);
        menuItem.setAvailable(true);
        menuItem.setOrderCount(0);
    }

    // ==================== addMenuItem ====================

    @Test
    @DisplayName("addMenuItem - should throw NotFoundException when restaurant not found")
    void addMenuItem_restaurantNotFound_throwsNotFoundException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.empty());

        CreateMenuItemRequest req = buildCreateRequest();
        MultipartFile image = mockImage();

        assertThatThrownBy(() -> menuItemService.addMenuItem(restaurantId, req, image, ownerId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("addMenuItem - should throw ForbiddenException when user is not the owner")
    void addMenuItem_notOwner_throwsForbiddenException() {
        UUID anotherUserId = UUID.randomUUID();
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));

        CreateMenuItemRequest req = buildCreateRequest();
        MultipartFile image = mockImage();

        assertThatThrownBy(() -> menuItemService.addMenuItem(restaurantId, req, image, anotherUserId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("addMenuItem - should save and return menu item on valid request")
    void addMenuItem_validRequest_savesAndReturnsResponse() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(cloudinaryService.uploadImage(any(), anyString()))
                .thenReturn(Map.of("url", "http://cdn.url/img", "publicId", "img_123"));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);

        CreateMenuItemRequest req = buildCreateRequest();
        MultipartFile image = mockImage();

        MenuItemResponse response = menuItemService.addMenuItem(restaurantId, req, image, ownerId);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Biryani");
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    // ==================== updateMenuItem ====================

    @Test
    @DisplayName("updateMenuItem - should throw NotFoundException when restaurant not found")
    void updateMenuItem_restaurantNotFound_throwsNotFoundException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuItemService.updateMenuItem(restaurantId, 1L, new UpdateMenuItemRequest(), ownerId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("updateMenuItem - should throw NotFoundException when menu item not found")
    void updateMenuItem_menuItemNotFound_throwsNotFoundException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> menuItemService.updateMenuItem(restaurantId, 99L, new UpdateMenuItemRequest(), ownerId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("updateMenuItem - should throw ForbiddenException when user is not the owner")
    void updateMenuItem_notOwner_throwsForbiddenException() {
        UUID anotherUser = UUID.randomUUID();
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));

        assertThatThrownBy(() -> menuItemService.updateMenuItem(restaurantId, 1L, new UpdateMenuItemRequest(), anotherUser))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("updateMenuItem - should update fields and return response on valid request")
    void updateMenuItem_validRequest_updatesAndReturns() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(menuItem);

        UpdateMenuItemRequest req = new UpdateMenuItemRequest();
        req.setName("Chicken Biryani");
        req.setPrice(18.0);

        MenuItemResponse response = menuItemService.updateMenuItem(restaurantId, 1L, req, ownerId);

        assertThat(response).isNotNull();
        assertThat(menuItem.getName()).isEqualTo("Chicken Biryani");
        assertThat(menuItem.getPrice()).isEqualTo(18.0);
        verify(menuItemRepository).save(menuItem);
    }

    // ==================== deleteMenuItem ====================

    @Test
    @DisplayName("deleteMenuItem - should throw BadRequestException if item has order history")
    void deleteMenuItem_hasOrderHistory_throwsBadRequest() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderItemRepository.existsByMenuItem(menuItem)).thenReturn(true);

        assertThatThrownBy(() -> menuItemService.deleteMenuItem(restaurantId, 1L, ownerId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete");
    }

    @Test
    @DisplayName("deleteMenuItem - should delete menu item and remove from preferences when no order history")
    void deleteMenuItem_noOrderHistory_deletesSuccessfully() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderItemRepository.existsByMenuItem(menuItem)).thenReturn(false);
        when(preferenceRepository.findByFavouriteFoodsContaining(menuItem)).thenReturn(List.of());

        menuItemService.deleteMenuItem(restaurantId, 1L, ownerId);

        verify(menuItemRepository).delete(menuItem);
    }

    @Test
    @DisplayName("deleteMenuItem - should remove item from preferences before deleting")
    void deleteMenuItem_itemInPreferences_removesFromPreferencesFirst() {
        UserPreference pref = new UserPreference();
        pref.setFavouriteFoods(new ArrayList<>(List.of(menuItem)));

        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(orderItemRepository.existsByMenuItem(menuItem)).thenReturn(false);
        when(preferenceRepository.findByFavouriteFoodsContaining(menuItem)).thenReturn(List.of(pref));

        menuItemService.deleteMenuItem(restaurantId, 1L, ownerId);

        assertThat(pref.getFavouriteFoods()).doesNotContain(menuItem);
        verify(preferenceRepository).save(pref);
        verify(menuItemRepository).delete(menuItem);
    }

    // ==================== Helpers ====================

    private CreateMenuItemRequest buildCreateRequest() {
        CreateMenuItemRequest req = new CreateMenuItemRequest();
        req.setName("Biryani");
        req.setPrice(15.0);
        req.setDescription("Spicy rice dish");
        req.setCuisineType(CuisineType.INDIAN);
        req.setDietaryRestriction(DietaryRestriction.NON_VEG);
        req.setIsSpecial(false);
        return req;
    }

    private MultipartFile mockImage() {
        return new MockMultipartFile("image", "biryani.jpg", "image/jpeg", new byte[]{1, 2, 3});
    }
}

