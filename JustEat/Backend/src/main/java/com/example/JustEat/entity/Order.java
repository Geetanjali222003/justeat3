package com.example.JustEat.entity;

import com.example.JustEat.enums.OrderStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.ArrayList;

import java.util.UUID;

/**
 * Represents a customer's order placed at a restaurant.
 * An order contains multiple order items (menu items with quantities),
 * tracks the total amount, and has a status (PENDING, CONFIRMED, DELIVERED, etc.).
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends BaseEntity{
    // Public-facing unique identifier for this order
    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    // The customer who placed this order
    @NotNull(message = "Order must be associated with a user")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User user;

    // The restaurant fulfilling this order
    @NotNull(message = "Order must be associated with a restaurant")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Restaurant restaurant;

    // Total order amount (calculated from order items)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double totalAmount;

    // Current status of the order (PENDING, CONFIRMED, PREPARING, DELIVERED, etc.)
    @Enumerated(EnumType.STRING)
    @NotNull
    private OrderStatus status = OrderStatus.PENDING;

    // Auto-generate public UUID before persisting
    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    // Collection of items in this order (each with menu item, quantity, price)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
