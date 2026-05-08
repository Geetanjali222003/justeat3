package com.example.JustEat.controller;

import com.example.JustEat.dto.request.AddToCartRequest;
import com.example.JustEat.dto.request.UpdateCartItemRequest;
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
    // Controller handling customer's cart actions (add/update/remove/clear)
    // Delegates actual operations to CartService; endpoints return simple messages

    // Add item to the current user's cart
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@Valid @RequestBody AddToCartRequest request
    ) {
        cartService.addToCart(
                request.getMenuItemId(),
                request.getQuantity()
        );

        return ResponseEntity.ok("Item added to cart");
    }

    // Get the current authenticated user's cart
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {

        return ResponseEntity.ok(cartService.getCart());
    }

    // Update quantity for a specific cart item
    @PutMapping("/item/{id}")
    public ResponseEntity<String> updateQuantity(@PathVariable Long id, @Valid @RequestBody UpdateCartItemRequest request) {
        cartService.updateQuantity(id, request.getQuantity());
        return ResponseEntity.ok("Quantity updated");
    }

    // Remove a specific item from the cart
    @DeleteMapping("/item/{id}")
    public ResponseEntity<String> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.ok("Item removed");
    }

    // Clear the user's cart
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok("Cart cleared");
    }
}