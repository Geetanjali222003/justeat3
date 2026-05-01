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

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends BaseEntity{
    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @NotNull(message = "Order must be associated with a user")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User user;
    @NotNull(message = "Order must be associated with a restaurant")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Restaurant restaurant;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @NotNull
    private OrderStatus status = OrderStatus.PENDING;

    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
