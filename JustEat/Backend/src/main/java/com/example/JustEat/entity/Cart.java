package com.example.JustEat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a customer's shopping cart.
 * A cart is tied to a single user and a single restaurant (items from one restaurant at a time).
 * Contains cart items (menu item + quantity) and tracks the total amount.
 */
@Entity
@Getter
@Setter
public class Cart extends BaseEntity{

    // The customer who owns this cart (one cart per user)
    @NotNull(message = "Cart must be associated with a user")
    @OneToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,unique = true)
    private User user;

    // The restaurant from which items are being added (cart is restaurant-specific)
    @NotNull(message = "A restaurant must be selected to start a cart")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    // Collection of items added to the cart
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL , orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    // Computed total price (sum of all cart items)
    private Double totalAmount = 0.0;
}
