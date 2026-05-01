package com.example.JustEat.dto.request;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRestaurantRequest {
    @NotBlank
    @Size(min = 2,max = 100)
    private String name;

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotNull
    private Location location;

    @NotNull
    private List<CuisineType> cuisineTypes;

    private String imageUrl;
    private String imagePublicId;
}
