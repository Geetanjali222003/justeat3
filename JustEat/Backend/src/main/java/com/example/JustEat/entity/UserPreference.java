package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_preference")
@Getter
@Setter
public class UserPreference extends BaseEntity {
    @NotNull(message = "Preferences must be linked to a user")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_preference_favourite_cuisines", joinColumns = @JoinColumn(name = "user_preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine_type")
    private List<CuisineType> favouriteCuisines = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_preference_dietary_restrictions", joinColumns = @JoinColumn(name = "user_preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_restriction")
    private List<DietaryRestriction> dietaryRestrictions = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_preference_favourite_restaurants",
            joinColumns = @JoinColumn(name = "user_preference_id"),
            inverseJoinColumns = @JoinColumn(name = "restaurant_id")
    )
    private List<Restaurant> favouriteRestaurants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_preference_favourite_foods",
            joinColumns = @JoinColumn(name = "user_preference_id"),
            inverseJoinColumns = @JoinColumn(name = "food_id")
    )
    private List<MenuItem> favouriteFoods = new ArrayList<>();
}
