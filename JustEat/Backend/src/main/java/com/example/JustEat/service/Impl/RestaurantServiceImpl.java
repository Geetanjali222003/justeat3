package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.Location;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.RestaurantMapper;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.CloudinaryService;
import com.example.JustEat.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final CloudinaryService cloudinaryService;
    @Override
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
        return restaurants.stream().map(restaurant -> RestaurantMapper.toResponse(restaurant))
                .toList();
    }

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
    public List<RestaurantResponse> getMyRestaurants() {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID ownerId = UUID.fromString(userIdStr);
        return restaurantRepository.findByOwnerPublicId(ownerId)
                .stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }
}
