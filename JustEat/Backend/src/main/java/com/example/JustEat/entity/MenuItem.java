package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a menu item offered by a restaurant.
 * Contains item details (name, price, description, image), categorization (cuisine type, dietary restrictions),
 * and flags for special offers and availability.
 */
@Entity
@Getter
@Setter
public class MenuItem extends BaseEntity {

    // Name of the menu item (e.g., "Margherita Pizza")
    @NotBlank
    @Size(min = 2, max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    // Price in currency units (must be positive)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double price;

    // Detailed description of the item
    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    // URL to the item's image (uploaded to Cloudinary or similar service)
    @Column(nullable = false)
    private String imageUrl;

    // Public ID from the image service (used for deletion)
    @Column(name = "image_public_id")
    private String imagePublicId;

    // The restaurant that offers this menu item (many-to-one relationship)
    @NotNull(message = "MenuItem must belong to a restaurant")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Restaurant restaurant;

    // Flag indicating if this item is marked as "special" by the owner
    private boolean isSpecial;

    // Flag indicating if this item is the "deal of the day"
    private boolean isDealOfDay;

    // Availability flag (true if customers can order this item)
    private boolean isAvailable = true;

    // Counter tracking how many times this item has been ordered (for analytics/recommendations)
    @Min(0)
    @Column(nullable = false)
    private Integer orderCount = 0;

    // Dietary restriction category (e.g., VEGETARIAN, VEGAN, NON_VEG)
    @NotNull
    @Enumerated(EnumType.STRING)
    private DietaryRestriction dietaryRestriction;

    // Cuisine type category (e.g., ITALIAN, CHINESE, INDIAN)
    @NotNull
    @Enumerated(EnumType.STRING)
    private CuisineType cuisineType;
}
