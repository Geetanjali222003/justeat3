package com.example.JustEat.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {

    private Long menuItemId;
    private String name;
    private Double price;
    private int quantity;
}