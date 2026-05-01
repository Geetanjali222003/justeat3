package com.example.JustEat.repository;

import com.example.JustEat.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    @Query("SELECT oi.menuItem.id, oi.menuItem.name, oi.menuItem.restaurant.name, " +
           "SUM(oi.quantity) as totalOrdered, oi.menuItem.price, oi.menuItem.imageUrl " +
           "FROM OrderItem oi " +
           "GROUP BY oi.menuItem.id, oi.menuItem.name, oi.menuItem.restaurant.name, " +
           "oi.menuItem.price, oi.menuItem.imageUrl " +
           "ORDER BY totalOrdered DESC " +
           "LIMIT 5")
    List<Object[]> findMostOrderedItems();
}
