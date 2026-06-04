package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a restaurant in the food ordering platform.
 * Each restaurant is owned by a user with OWNER role, offers menu items, and can receive ratings.
 * Contains details like name, location, cuisine types, and operational status.
 */
@Entity
@Table(name="restaurants")
@Getter
@Setter
public class Restaurant extends BaseEntity{

    // Public-facing unique identifier (used in APIs)
    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    // Restaurant name
    @NotBlank(message = "Restaurant name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    // Short description of the restaurant
    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    // Physical location/city where restaurant operates
    @NotNull(message = "Location is required")
    @Enumerated(EnumType.STRING)
    private Location location;

    // List of cuisine types served (e.g., ITALIAN, CHINESE, INDIAN)
    @NotNull(message = "Cuisine type is required")
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "restaurant_cuisines",
            joinColumns = @JoinColumn(name = "restaurant_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine")
    private List<CuisineType> cuisineTypes = new ArrayList<>();

    // URL to restaurant's main image
    @NotBlank
    @Column(nullable = false)
    private String imageUrl;

    // Public ID from image service (for deletion)
    @Column(name = "image_public_id")
    private String imagePublicId;

    // The user (OWNER role) who owns/manages this restaurant
    @NotNull(message = "Restaurant must have an owner")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    @JsonIgnore
    private User owner;

    // Current operational status (OPEN, CLOSED, TEMPORARILY_CLOSED)
    @NotNull
    @Enumerated(EnumType.STRING)
    private RestaurantStatus status = RestaurantStatus.OPEN;

    // Collection of menu items offered by this restaurant
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    @JsonIgnore
    private List<MenuItem> menuItems = new ArrayList<>();

    // Collection of customer ratings for this restaurant
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RestaurantRating> ratings = new ArrayList<>();

    // Auto-generate public UUID before persisting
    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    // Computed average rating (updated when customers rate the restaurant)
    @Column(nullable = false)
    private Double rating =0.0;

    // Total number of ratings received
    @Column(nullable = false)
    private Integer ratingCount=0;
}
