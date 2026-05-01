package com.example.JustEat.service.Impl;

import com.example.JustEat.dto.request.RatingRequest;
import com.example.JustEat.dto.response.MostOrderedItemResponse;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.RestaurantRating;
import com.example.JustEat.entity.User;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.OrderItemRepository;
import com.example.JustEat.repository.RestaurantRatingRepository;
import com.example.JustEat.repository.RestaurantRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.RatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingServiceImpl implements RatingService {

    private final RestaurantRatingRepository ratingRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public String saveRating(RatingRequest request) {
        // Get current user
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Get restaurant
        Restaurant restaurant = restaurantRepository.findByPublicId(request.getRestaurantId())
                .orElseThrow(() -> new NotFoundException("Restaurant not found"));

        // Check if rating exists
        Optional<RestaurantRating> existingRating = ratingRepository.findByUserAndRestaurant(user, restaurant);

        RestaurantRating rating;
        String message;
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setRating(request.getRating());
            message = "Rating updated successfully";
        } else {
            // Create new rating
            rating = new RestaurantRating();
            rating.setUser(user);
            rating.setRestaurant(restaurant);
            rating.setRating(request.getRating());
            message = "Rating saved successfully";
        }
        ratingRepository.save(rating);

        // Recalculate average rating
        updateRestaurantRating(restaurant);

        log.info("Rating saved for restaurant {}", request.getRestaurantId());
        return message;
    }

    private void updateRestaurantRating(Restaurant restaurant) {
        Double avgRating = ratingRepository.findAverageRatingByRestaurant(restaurant);
        Integer ratingCount = ratingRepository.countByRestaurant(restaurant);

        restaurant.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        restaurant.setRatingCount(ratingCount != null ? ratingCount : 0);
        restaurantRepository.save(restaurant);
    }

    @Override
    public List<MostOrderedItemResponse> getMostOrderedItems() {
        log.info("Most ordered items fetched");
        
        List<Object[]> results = orderItemRepository.findMostOrderedItems();
        
        return results.stream()
                .map(row -> MostOrderedItemResponse.builder()
                        .menuItemId((Long) row[0])
                        .foodName((String) row[1])
                        .restaurantName((String) row[2])
                        .totalOrdered((Long) row[3])
                        .price((Double) row[4])
                        .imageUrl((String) row[5])
                        .build())
                .collect(Collectors.toList());
    }
}

