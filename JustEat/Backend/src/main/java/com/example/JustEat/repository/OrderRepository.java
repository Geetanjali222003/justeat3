package com.example.JustEat.repository;

import com.example.JustEat.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByPublicId(UUID publicId);
    
    List<Order> findByRestaurant_Id(Long restaurantId);
    
    // Find all orders for restaurants owned by a specific owner
    List<Order> findByRestaurant_OwnerId(Long ownerId);
    
    // Find orders by restaurant owner, sorted by newest first
    List<Order> findByRestaurant_OwnerIdOrderByCreatedAtDesc(Long ownerId);
}