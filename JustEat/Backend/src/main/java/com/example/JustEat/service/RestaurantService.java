package com.example.JustEat.service;

import com.example.JustEat.dto.request.CreateRestaurantRequest;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.enums.Location;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {
    RestaurantResponse createRestaurant(CreateRestaurantRequest request, MultipartFile image);
    List<RestaurantResponse> getAllRestaurants(Location location);
    RestaurantResponse getRestaurant(UUID publicId);
    List<RestaurantResponse> getMyRestaurants();
}
