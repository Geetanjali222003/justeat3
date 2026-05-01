package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class MenuItem extends BaseEntity{

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double price;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    @NotNull(message = "MenuItem must belong to a restaurant")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Restaurant restaurant;

    private boolean isSpecial;

    private boolean isAvailable = true;

    @Min(0)
    @Column(nullable = false)
    private Integer orderCount = 0;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DietaryRestriction dietaryRestriction;

    @NotNull
    @Enumerated(EnumType.STRING)
    private CuisineType cuisineType;
}
