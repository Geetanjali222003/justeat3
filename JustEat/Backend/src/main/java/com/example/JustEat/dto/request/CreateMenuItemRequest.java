package com.example.JustEat.dto.request;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateMenuItemRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double price;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String imageUrl;
    private String imagePublicId;

    @NotNull
    private DietaryRestriction dietaryRestriction;

    @NotNull
    private CuisineType cuisineType;

    private Boolean isSpecial = false;
}
