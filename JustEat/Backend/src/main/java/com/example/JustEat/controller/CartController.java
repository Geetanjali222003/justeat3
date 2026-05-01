package com.example.JustEat.controller;

import com.example.JustEat.dto.request.AddToCartRequest;
import com.example.JustEat.dto.response.CartResponse;
import com.example.JustEat.service.CartService;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // ➕ Add item
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @Valid @RequestBody AddToCartRequest request
    ) {

        cartService.addToCart(
                request.getMenuItemId(),
                request.getQuantity()
        );

        return ResponseEntity.ok("Item added to cart");
    }

    // 📦 Get cart
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    // ❌ Remove item
    @DeleteMapping("/item/{id}")
    public ResponseEntity<String> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.ok("Item removed");
    }

    // 🧹 Clear cart
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok("Cart cleared");
    }
}