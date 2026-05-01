package com.example.JustEat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class OrderItem extends BaseEntity{
    @NotNull(message = "OrderItem must be linked to an order")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Order order;

    @NotNull(message = "OrderItem must reference a menu item")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private MenuItem menuItem;

    @Min(1)
    private int quantity;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double price;
}
