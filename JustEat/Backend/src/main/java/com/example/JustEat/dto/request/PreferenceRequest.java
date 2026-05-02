package com.example.JustEat.dto.request;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PreferenceRequest {
    private List<CuisineType> favouriteCuisines;
    private List<DietaryRestriction> dietaryRestrictions;
    private List<UUID> restaurantIds;
    private List<Long> foodIds;
}

