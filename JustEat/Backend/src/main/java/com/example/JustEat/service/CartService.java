package com.example.JustEat.service;

import com.example.JustEat.dto.response.CartResponse;
public interface  CartService {
    void addToCart(Long menuItemId, int quantity);
    CartResponse getCart();
    void removeItem(Long cartItemId);
    void clearCart();
}