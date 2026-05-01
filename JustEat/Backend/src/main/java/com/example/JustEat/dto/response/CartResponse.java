package com.example.JustEat.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {

    private Long restaurantId;
    private String restaurantName;
    private List<CartItemResponse> items;
    private Double totalAmount;
}