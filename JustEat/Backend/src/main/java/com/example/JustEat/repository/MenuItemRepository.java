package com.example.JustEat.repository;

import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem,Long> {
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    List<MenuItem> findByRestaurant_Id(Long restaurantId);
    Optional<MenuItem> findById(Long id);
    List<MenuItem> findByRestaurant_PublicIdAndIsAvailableTrue(UUID publicId);
}
