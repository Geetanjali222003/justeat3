package com.example.JustEat.repository;

import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant,Long> {
    List<Restaurant> findByLocationAndStatus(Location location, RestaurantStatus status);
    List<Restaurant> findByStatus(RestaurantStatus status);
    Optional<Restaurant> findByPublicId(UUID publicId);
    List<Restaurant> findByOwnerPublicId(UUID ownerPublicId);
}
