package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Stores a user's food and restaurant preferences.
 * Used for personalized recommendations, filtering, and improving user experience.
 * Contains favorite cuisines, dietary restrictions, favorite restaurants, and favorite food items.
 */
@Entity
@Table(name = "user_preference")
@Getter
@Setter
public class UserPreference extends BaseEntity {
    // The user these preferences belong to (one-to-one relationship)
    @NotNull(message = "Preferences must be linked to a user")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // List of cuisine types the user prefers (e.g., ITALIAN, CHINESE)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_preference_favourite_cuisines", joinColumns = @JoinColumn(name = "user_preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine_type")
    private List<CuisineType> favouriteCuisines = new ArrayList<>();

    // Dietary restrictions (e.g., VEGETARIAN, VEGAN, GLUTEN_FREE)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_preference_dietary_restrictions", joinColumns = @JoinColumn(name = "user_preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_restriction")
    private List<DietaryRestriction> dietaryRestrictions = new ArrayList<>();

    // List of restaurants the user has marked as favorites
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_preference_favourite_restaurants",
            joinColumns = @JoinColumn(name = "user_preference_id"),
            inverseJoinColumns = @JoinColumn(name = "restaurant_id")
    )
    private List<Restaurant> favouriteRestaurants = new ArrayList<>();

    // List of menu items the user has marked as favorites
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_preference_favourite_foods",
            joinColumns = @JoinColumn(name = "user_preference_id"),
            inverseJoinColumns = @JoinColumn(name = "food_id")
    )
    private List<MenuItem> favouriteFoods = new ArrayList<>();
}
