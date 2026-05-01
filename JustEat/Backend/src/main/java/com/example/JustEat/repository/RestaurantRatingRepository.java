package com.example.JustEat.repository;

import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.RestaurantRating;
import com.example.JustEat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantRatingRepository extends JpaRepository<RestaurantRating, Long> {

    Optional<RestaurantRating> findByUserAndRestaurant(User user, Restaurant restaurant);

    @Query("SELECT AVG(r.rating) FROM RestaurantRating r WHERE r.restaurant = :restaurant")
    Double findAverageRatingByRestaurant(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT COUNT(r) FROM RestaurantRating r WHERE r.restaurant = :restaurant")
    Integer countByRestaurant(@Param("restaurant") Restaurant restaurant);
}

