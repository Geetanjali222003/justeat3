package com.example.JustEat.controller;

import com.example.JustEat.dto.request.RatingRequest;
import com.example.JustEat.dto.response.MostOrderedItemResponse;
import com.example.JustEat.dto.response.RestaurantResponse;
import com.example.JustEat.enums.Location;
import com.example.JustEat.service.RatingService;
import com.example.JustEat.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final RatingService ratingService;
    private final RestaurantService restaurantService;

    @PostMapping("/ratings")
    public ResponseEntity<String> saveRating(@Valid @RequestBody RatingRequest request) {
        String message = ratingService.saveRating(request);
        return ResponseEntity.status(HttpStatus.OK).body(message);
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) Location location) {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(location);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/most-ordered")
    public ResponseEntity<List<MostOrderedItemResponse>> getMostOrderedItems() {
        List<MostOrderedItemResponse> items = ratingService.getMostOrderedItems();
        return ResponseEntity.ok(items);
    }
}

