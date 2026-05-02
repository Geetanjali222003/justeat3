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
@Table(name = "preferences")
@Getter
@Setter
public class UserPreference extends BaseEntity {
    @NotNull(message = "Preferences must be linked to a user")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection
    @CollectionTable(name = "preference_cuisines", joinColumns = @JoinColumn(name = "preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine")
    private List<CuisineType> favouriteCuisines = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "preference_dietary", joinColumns = @JoinColumn(name = "preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_restriction")
    private List<DietaryRestriction> dietaryRestrictions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "preference_restaurants",
            joinColumns = @JoinColumn(name = "preference_id"),
            inverseJoinColumns = @JoinColumn(name = "restaurant_id")
    )
    private List<Restaurant> favouriteRestaurants = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "preference_foods",
            joinColumns = @JoinColumn(name = "preference_id"),
            inverseJoinColumns = @JoinColumn(name = "food_id")
    )
    private List<MenuItem> favouriteFoods = new ArrayList<>();
}
