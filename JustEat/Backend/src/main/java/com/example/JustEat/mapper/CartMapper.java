package com.example.JustEat.mapper;

import com.example.JustEat.dto.response.CartItemResponse;
import com.example.JustEat.dto.response.CartResponse;
import com.example.JustEat.entity.Cart;

import java.util.stream.Collectors;

public class CartMapper {
    // Mapper that converts Cart entity to CartResponse DTO
    // - Maps cart items to CartItemResponse and preserves total amount and restaurant info
    public static CartResponse toResponse(Cart cart) {

        // Use simple stream mapping for items; avoid business logic here
        return CartResponse.builder()
                .restaurantId(cart.getRestaurant().getId())
                .restaurantName(cart.getRestaurant().getName())
                .items(
                        cart.getItems().stream()
                                .map(item -> CartItemResponse.builder()
                                        .id(item.getId())
                                        .menuItemId(item.getMenuItem().getId())
                                        .name(item.getMenuItem().getName())
                                        .price(item.getPrice())
                                        .quantity(item.getQuantity())
                                        .build()
                                )
                                .collect(Collectors.toList())
                )
                .totalAmount(cart.getTotalAmount())
                .build();
    }
}