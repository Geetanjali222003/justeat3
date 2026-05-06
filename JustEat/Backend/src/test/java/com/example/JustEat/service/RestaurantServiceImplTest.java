package com.example.JustEat.service;

import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Gender;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.Impl.RestaurantServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RestaurantService Tests")
class RestaurantServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RestaurantRepository restaurantRepository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private UserPreferenceRepository preferenceRepository;

    @InjectMocks
    private RestaurantServiceImpl restaurantService;

    private User owner;
    private Restaurant restaurant;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        owner = new User();
        owner.setId(1L);
        owner.setPublicId(userId);
        owner.setEmail("owner@example.com");
        owner.setFirstName("Alice");
        owner.setLastName("Smith");
        owner.setRole(Role.OWNER);
        owner.setGender(Gender.FEMALE);
        owner.setPhoneNumber("9876543210");
        owner.setLocation(Location.NOIDA);

        restaurant = new Restaurant();
        restaurant.setId(1L);
        restaurant.setPublicId(UUID.randomUUID());
        restaurant.setName("Test Restaurant");
        restaurant.setDescription("Good food");
        restaurant.setLocation(Location.NOIDA);
        restaurant.setCuisineTypes(List.of(CuisineType.INDIAN));
        restaurant.setImageUrl("http://image.url");
        restaurant.setOwner(owner);
        restaurant.setStatus(RestaurantStatus.OPEN);
        restaurant.setMenuItems(new ArrayList<>());
        restaurant.setRatings(new ArrayList<>());

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(userId.toString());
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    // ==================== createRestaurant ====================

    @Test
    @DisplayName("createRestaurant - should throw NotFoundException if owner not found")
    void createRestaurant_ownerNotFound_throwsNotFoundException() {
        CreateRestaurantRequest req = buildRequest();
        MultipartFile image = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1});

        when(userRepository.findByPublicId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> restaurantService.createRestaurant(req, image))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("createRestaurant - should save restaurant and return response")
    void createRestaurant_validRequest_createsAndReturnsResponse() {
        CreateRestaurantRequest req = buildRequest();
        MultipartFile image = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[]{1});

        when(userRepository.findByPublicId(userId)).thenReturn(Optional.of(owner));
        when(cloudinaryService.uploadImage(any(), anyString()))
                .thenReturn(Map.of("url", "http://cdn.url/img", "publicId", "img_id"));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(restaurant);

        RestaurantResponse response = restaurantService.createRestaurant(req, image);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Restaurant");
        verify(restaurantRepository).save(any(Restaurant.class));
    }

    // ==================== getAllRestaurants ====================

    @Test
    @DisplayName("getAllRestaurants - should return all open restaurants when no location filter")
    void getAllRestaurants_noLocation_returnsAllOpen() {
        when(restaurantRepository.findByStatus(RestaurantStatus.OPEN)).thenReturn(List.of(restaurant));
        when(preferenceRepository.findByUserPublicId(any())).thenReturn(Optional.empty());

        List<RestaurantResponse> result = restaurantService.getAllRestaurants(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Restaurant");
    }

    @Test
    @DisplayName("getAllRestaurants - should filter by location when provided")
    void getAllRestaurants_withLocation_filtersResults() {
        when(restaurantRepository.findByLocationAndStatus(Location.NOIDA, RestaurantStatus.OPEN))
                .thenReturn(List.of(restaurant));
        when(preferenceRepository.findByUserPublicId(any())).thenReturn(Optional.empty());

        List<RestaurantResponse> result = restaurantService.getAllRestaurants(Location.NOIDA);

        assertThat(result).hasSize(1);
        verify(restaurantRepository).findByLocationAndStatus(Location.NOIDA, RestaurantStatus.OPEN);
    }

    @Test
    @DisplayName("getAllRestaurants - should return empty list when none match location")
    void getAllRestaurants_noMatchingLocation_returnsEmpty() {
        when(restaurantRepository.findByLocationAndStatus(Location.DELHI, RestaurantStatus.OPEN))
                .thenReturn(List.of());
        when(preferenceRepository.findByUserPublicId(any())).thenReturn(Optional.empty());

        List<RestaurantResponse> result = restaurantService.getAllRestaurants(Location.DELHI);

        assertThat(result).isEmpty();
    }

    // ==================== Helpers ====================

    private CreateRestaurantRequest buildRequest() {
        CreateRestaurantRequest req = new CreateRestaurantRequest();
        req.setName("Test Restaurant");
        req.setDescription("Good food");
        req.setLocation(Location.NOIDA);
        req.setCuisineTypes(List.of(CuisineType.INDIAN));
        return req;
    }
}

