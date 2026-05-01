package com.example.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MostOrderedItemResponse {
    private Long menuItemId;
    private String foodName;
    private String restaurantName;
    private Long totalOrdered;
    private Double price;
    private String imageUrl;
}

