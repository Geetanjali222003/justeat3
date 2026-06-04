package com.example.JustEat.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a single item in a customer's shopping cart.
 * Links a cart to a specific menu item with a quantity and price snapshot.
 * When cart is converted to an order, these become OrderItems.
 */
@Entity
@Getter
@Setter
public class CartItem extends BaseEntity{

    // The cart this item belongs to
    @NotNull(message = "CartItem must belong to a cart")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // The menu item being added to the cart
    @NotNull(message = "CartItem must reference a menu item")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    // Quantity of this menu item in the cart (1-99)
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 99, message = "Quantity cannot exceed 99 per item")
    private int quantity;

    // Price snapshot at time of adding to cart (protects against price changes)
    @NotNull(message = "Price snapshot is required")
    private Double price;
}
