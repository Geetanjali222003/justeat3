package com.example.JustEat.dto.request;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMenuItemRequest {
    private String name;

    @DecimalMin(value = "0.0" , inclusive = false)
    private Double price;

    private String description;
    private String imageUrl;
    private DietaryRestriction dietaryRestriction;
    private CuisineType cuisineType;
    private Boolean isSpecial;
    private Boolean isAvailable;
}
