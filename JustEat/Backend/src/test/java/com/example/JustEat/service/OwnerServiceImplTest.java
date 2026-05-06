package com.example.JustEat.service;

import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.ForbiddenException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.OrderRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.service.Impl.OwnerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OwnerService Tests")
class OwnerServiceImplTest {

    @Mock private MenuItemRepository menuItemRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private UserPreferenceRepository preferenceRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks
    private OwnerServiceImpl ownerService;

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
        restaurant.setName("Pizza Palace");
        restaurant.setDescription("Best pizza in town");
        restaurant.setLocation(Location.NOIDA);
        restaurant.setCuisineTypes(List.of(CuisineType.ITALIAN));
        restaurant.setImageUrl("http://img.url/pizza.jpg");
        restaurant.setOwner(owner);
        restaurant.setStatus(RestaurantStatus.OPEN);
        restaurant.setMenuItems(new ArrayList<>());
        restaurant.setRatings(new ArrayList<>());

        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Margherita");
        menuItem.setPrice(12.0);
        menuItem.setDescription("Classic pizza");
        menuItem.setImageUrl("http://img.url/margherita.jpg");
        menuItem.setRestaurant(restaurant);
        menuItem.setCuisineType(CuisineType.ITALIAN);
        menuItem.setDietaryRestriction(DietaryRestriction.VEG);
        menuItem.setSpecial(false);
        menuItem.setAvailable(true);
        menuItem.setOrderCount(5);
    }

    // ==================== getOwnerRestaurants ====================

    @Test
    @DisplayName("getOwnerRestaurants - should return list of restaurants for owner")
    void getOwnerRestaurants_withRestaurants_returnsList() {
        when(restaurantRepository.findByOwnerPublicId(ownerId)).thenReturn(List.of(restaurant));

        List<RestaurantResponse> result = ownerService.getOwnerRestaurants(ownerId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Pizza Palace");
    }

    @Test
    @DisplayName("getOwnerRestaurants - should return empty list when owner has no restaurants")
    void getOwnerRestaurants_noRestaurants_returnsEmptyList() {
        when(restaurantRepository.findByOwnerPublicId(ownerId)).thenReturn(List.of());

        List<RestaurantResponse> result = ownerService.getOwnerRestaurants(ownerId);

        assertThat(result).isEmpty();
    }

    // ==================== getOwnerRestaurantById ====================

    @Test
    @DisplayName("getOwnerRestaurantById - should throw NotFoundException if restaurant not found")
    void getOwnerRestaurantById_notFound_throwsNotFoundException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ownerService.getOwnerRestaurantById(ownerId, restaurantId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("getOwnerRestaurantById - should throw ForbiddenException when user does not own restaurant")
    void getOwnerRestaurantById_wrongOwner_throwsForbiddenException() {
        UUID anotherOwner = UUID.randomUUID();
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));

        assertThatThrownBy(() -> ownerService.getOwnerRestaurantById(anotherOwner, restaurantId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("getOwnerRestaurantById - should return restaurant when owner matches")
    void getOwnerRestaurantById_validOwner_returnsRestaurant() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));

        RestaurantResponse response = ownerService.getOwnerRestaurantById(ownerId, restaurantId);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Pizza Palace");
    }

    // ==================== deleteRestaurant ====================

    @Test
    @DisplayName("deleteRestaurant - should throw NotFoundException when restaurant not found")
    void deleteRestaurant_notFound_throwsNotFoundException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ownerService.deleteRestaurant(ownerId, restaurantId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("deleteRestaurant - should throw ForbiddenException when user does not own restaurant")
    void deleteRestaurant_wrongOwner_throwsForbiddenException() {
        UUID anotherOwner = UUID.randomUUID();
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));

        assertThatThrownBy(() -> ownerService.deleteRestaurant(anotherOwner, restaurantId))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("deleteRestaurant - should throw BadRequestException when restaurant has existing orders")
    void deleteRestaurant_hasOrders_throwsBadRequestException() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(orderRepository.existsByRestaurant(restaurant)).thenReturn(true);

        assertThatThrownBy(() -> ownerService.deleteRestaurant(ownerId, restaurantId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete");
    }

    @Test
    @DisplayName("deleteRestaurant - should delete successfully when no orders exist")
    void deleteRestaurant_noOrders_deletesSuccessfully() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(orderRepository.existsByRestaurant(restaurant)).thenReturn(false);
        when(preferenceRepository.findByFavouriteRestaurantsContaining(restaurant)).thenReturn(List.of());

        ownerService.deleteRestaurant(ownerId, restaurantId);

        verify(restaurantRepository).delete(restaurant);
    }

    @Test
    @DisplayName("deleteRestaurant - should remove restaurant from preferences before deleting")
    void deleteRestaurant_inPreferences_removesFromPreferencesFirst() {
        UserPreference pref = new UserPreference();
        pref.setFavouriteRestaurants(new ArrayList<>(List.of(restaurant)));

        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(orderRepository.existsByRestaurant(restaurant)).thenReturn(false);
        when(preferenceRepository.findByFavouriteRestaurantsContaining(restaurant)).thenReturn(List.of(pref));

        ownerService.deleteRestaurant(ownerId, restaurantId);

        assertThat(pref.getFavouriteRestaurants()).doesNotContain(restaurant);
        verify(preferenceRepository).save(pref);
        verify(restaurantRepository).delete(restaurant);
    }

    // ==================== updateSpecialFlag ====================

    @Test
    @DisplayName("updateSpecialFlag - should throw NotFoundException when item not found")
    void updateSpecialFlag_itemNotFound_throwsNotFoundException() {
        when(menuItemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ownerService.updateSpecialFlag(99L, true, ownerId))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("updateSpecialFlag - should throw ForbiddenException when user is not the owner")
    void updateSpecialFlag_notOwner_throwsForbiddenException() {
        UUID anotherUser = UUID.randomUUID();
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));

        assertThatThrownBy(() -> ownerService.updateSpecialFlag(1L, true, anotherUser))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("updateSpecialFlag - should set item as special when valid owner")
    void updateSpecialFlag_validOwner_setsSpecialFlag() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(menuItem)).thenReturn(menuItem);

        MenuItemResponse response = ownerService.updateSpecialFlag(1L, true, ownerId);

        assertThat(menuItem.isSpecial()).isTrue();
        assertThat(response).isNotNull();
        verify(menuItemRepository).save(menuItem);
    }

    // ==================== updateDealFlag ====================

    @Test
    @DisplayName("updateDealFlag - should set deal of day flag when valid owner")
    void updateDealFlag_validOwner_setsDealFlag() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(menuItem));
        when(menuItemRepository.save(menuItem)).thenReturn(menuItem);

        MenuItemResponse response = ownerService.updateDealFlag(1L, true, ownerId);

        assertThat(menuItem.isDealOfDay()).isTrue();
        assertThat(response).isNotNull();
        verify(menuItemRepository).save(menuItem);
    }

    // ==================== getRestaurantMenu ====================

    @Test
    @DisplayName("getRestaurantMenu - should return menu items for owner's restaurant")
    void getRestaurantMenu_validOwner_returnsMenuItems() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findByRestaurant(restaurant)).thenReturn(List.of(menuItem));

        List<MenuItemResponse> result = ownerService.getRestaurantMenu(ownerId, restaurantId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Margherita");
    }

    @Test
    @DisplayName("getRestaurantMenu - should return empty list when no menu items exist")
    void getRestaurantMenu_noItems_returnsEmptyList() {
        when(restaurantRepository.findByPublicId(restaurantId)).thenReturn(Optional.of(restaurant));
        when(menuItemRepository.findByRestaurant(restaurant)).thenReturn(List.of());

        List<MenuItemResponse> result = ownerService.getRestaurantMenu(ownerId, restaurantId);

        assertThat(result).isEmpty();
    }

    // ==================== searchOwnerRestaurants ====================

    @Test
    @DisplayName("searchOwnerRestaurants - should delegate to getOwnerRestaurants when keyword is empty")
    void searchOwnerRestaurants_emptyKeyword_returnsAllRestaurants() {
        when(restaurantRepository.findByOwnerPublicId(ownerId)).thenReturn(List.of(restaurant));

        List<RestaurantResponse> result = ownerService.searchOwnerRestaurants(ownerId, "");

        assertThat(result).hasSize(1);
        verify(restaurantRepository).findByOwnerPublicId(ownerId);
    }

    @Test
    @DisplayName("searchOwnerRestaurants - should search by keyword when provided")
    void searchOwnerRestaurants_withKeyword_searchesByKeyword() {
        when(restaurantRepository.searchByOwnerAndKeyword(ownerId, "pizza")).thenReturn(List.of(restaurant));

        List<RestaurantResponse> result = ownerService.searchOwnerRestaurants(ownerId, "pizza");

        assertThat(result).hasSize(1);
        verify(restaurantRepository).searchByOwnerAndKeyword(ownerId, "pizza");
    }
}

