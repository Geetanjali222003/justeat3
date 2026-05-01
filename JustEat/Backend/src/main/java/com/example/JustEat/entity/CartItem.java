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

@Entity
@Getter
@Setter
public class CartItem extends BaseEntity{

    @NotNull(message = "CartItem must belong to a cart")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @NotNull(message = "CartItem must reference a menu item")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 99, message = "Quantity cannot exceed 99 per item")
    private int quantity;
    @NotNull(message = "Price snapshot is required")
    private Double price;
}
