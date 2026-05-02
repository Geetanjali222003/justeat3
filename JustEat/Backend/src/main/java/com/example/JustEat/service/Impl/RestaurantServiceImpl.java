package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.RestaurantMapper;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserPreferenceRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.CloudinaryService;
import com.example.JustEat.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CloudinaryService cloudinaryService;
    private final UserPreferenceRepository preferenceRepository;
    
    @Override
    @Transactional
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request, MultipartFile image) {
        //get current user from jwt
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        User owner = userRepository.findByPublicId(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Upload image to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(image, "justeat/restaurants");
        String imageUrl = uploadResult.get("url");
        String publicId = uploadResult.get("publicId");

        //create restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setLocation(request.getLocation());
        restaurant.setCuisineTypes(request.getCuisineTypes());
        restaurant.setImageUrl(imageUrl);
        restaurant.setImagePublicId(publicId);
        restaurant.setOwner(owner);
        
        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getAllRestaurants(Location location) {
        List<Restaurant> restaurants;
        if(location!=null){
            restaurants = restaurantRepository.findByLocationAndStatus(
                    location,
                    com.example.JustEat.enums.RestaurantStatus.OPEN
            );
        }else{
            restaurants = restaurantRepository.findByStatus(
                    com.example.JustEat.enums.RestaurantStatus.OPEN
            );
        }
        
        // Get user preferences for sorting
        try {
            String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
            UUID userId = UUID.fromString(userIdStr);
            Optional<UserPreference> preferenceOpt = preferenceRepository.findByUserPublicId(userId);
            
            if (preferenceOpt.isPresent()) {
                UserPreference preference = preferenceOpt.get();
                List<CuisineType> favCuisines = preference.getFavouriteCuisines();
                Set<UUID> favRestaurantIds = preference.getFavouriteRestaurants() != null ?
                    preference.getFavouriteRestaurants().stream()
                        .map(Restaurant::getPublicId)
                        .collect(Collectors.toSet()) :
                    Collections.emptySet();
                
                // Sort: favorite restaurants first, then by cuisine match, then by rating
                restaurants = restaurants.stream()
                    .sorted((r1, r2) -> {
                        boolean r1IsFav = favRestaurantIds.contains(r1.getPublicId());
                        boolean r2IsFav = favRestaurantIds.contains(r2.getPublicId());
                        
                        if (r1IsFav && !r2IsFav) return -1;
                        if (!r1IsFav && r2IsFav) return 1;
                        
                        // Check cuisine match
                        if (favCuisines != null && !favCuisines.isEmpty()) {
                            long r1Match = r1.getCuisineTypes().stream()
                                .filter(favCuisines::contains).count();
                            long r2Match = r2.getCuisineTypes().stream()
                                .filter(favCuisines::contains).count();
                            
                            if (r1Match != r2Match) {
                                return Long.compare(r2Match, r1Match);
                            }
                        }
                        
                        // Sort by rating
                        return Double.compare(r2.getRating(), r1.getRating());
                    })
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            // If no auth or error, just return unsorted
        }
        
        return restaurants.stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurant(UUID publicId){
        Restaurant restaurant = restaurantRepository.findByPublicId(publicId)
                .orElseThrow(()-> new NotFoundException("Restaurant not found"));
        validateRestaurantOpen(restaurant);
        return RestaurantMapper.toResponse(restaurant);
    }

    private void validateRestaurantOpen(Restaurant restaurant) {
        if (restaurant.getStatus() != com.example.JustEat.enums.RestaurantStatus.OPEN) {
            throw new BadRequestException("Restaurant is not available");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getMyRestaurants() {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID ownerId = UUID.fromString(userIdStr);
        return restaurantRepository.findByOwnerPublicId(ownerId)
                .stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }
}
