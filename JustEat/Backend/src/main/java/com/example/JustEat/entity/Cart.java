package com.example.JustEat.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Cart extends BaseEntity{

    @NotNull(message = "Cart must be associated with a user")
    @OneToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,unique = true)
    private User user;

    @NotNull(message = "A restaurant must be selected to start a cart")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL , orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    private Double totalAmount = 0.0;
}
