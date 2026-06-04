package com.example.JustEat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a customer's rating for a restaurant.
 * Each user can rate a restaurant only once (enforced by unique constraint).
 * Ratings are aggregated to compute the restaurant's overall rating.
 */
@Entity
@Table(name = "restaurant_ratings", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "restaurant_id"}))
@Getter
@Setter
public class RestaurantRating extends BaseEntity {

    // The user who submitted this rating
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The restaurant being rated
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    // Rating value (1-5 stars)
    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer rating;
}

