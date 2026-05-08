package com.example.JustEat.mapper;

import com.example.JustEat.dto.response.OrderItemResponse;
import com.example.JustEat.dto.response.OrderResponse;
import com.example.JustEat.entity.Order;

import java.util.stream.Collectors;

public class OrderMapper {
    // Utility mapper that converts Order entity -> OrderResponse DTO
    // - Concatenates customer's first and last name for display
    // - Maps each OrderItem to an OrderItemResponse containing menu item id/name, price and qty
    public static OrderResponse toResponse(Order order) {

        // Build the response using the entity's relationships
        // Keep mapping logic simple and side-effect free
        return OrderResponse.builder()
                .publicId(order.getPublicId())
                .restaurantName(order.getRestaurant().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                // Combine first + last name into a single display field
                .customerName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .customerEmail(order.getUser().getEmail())
                .items(
                        order.getItems().stream()
                                .map(item -> OrderItemResponse.builder()
                                        .menuItemId(item.getMenuItem().getId())
                                        .name(item.getMenuItem().getName())
                                        .price(item.getPrice())
                                        .quantity(item.getQuantity())
                                        .build()
                                )
                                .collect(Collectors.toList())
                )
                .build();
    }
}