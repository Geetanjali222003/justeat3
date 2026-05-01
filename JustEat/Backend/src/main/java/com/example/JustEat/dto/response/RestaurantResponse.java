package com.example.JustEat.dto.response;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class RestaurantResponse {
    private UUID publicId;
    private String name;
    private String description;
    private Location location;
    private List<CuisineType> cuisineTypes;
    private String imageUrl;
    private RestaurantStatus restaurantStatus;

    private Double rating;
    private Integer ratingCount;
}
