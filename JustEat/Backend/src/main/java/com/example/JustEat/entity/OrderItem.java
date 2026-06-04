package com.example.JustEat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a single menu item within a placed order.
 * Captures the menu item, quantity ordered, and the price at time of order (snapshot).
 * Multiple OrderItems make up a complete Order.
 */
@Entity
@Getter
@Setter
public class OrderItem extends BaseEntity{
    // The order this item belongs to
    @NotNull(message = "OrderItem must be linked to an order")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Order order;

    // The menu item that was ordered
    @NotNull(message = "OrderItem must reference a menu item")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private MenuItem menuItem;

    // Quantity ordered
    @Min(1)
    private int quantity;

    // Price at time of order (snapshot to handle future price changes)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double price;
}
