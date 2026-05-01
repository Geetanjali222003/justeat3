package com.example.JustEat.service.Impl;
import com.example.JustEat.dto.response.CartResponse;
//import com.example.JustEat.mapper.CartMapper;
//import com.example.JustEat.dto.response.CartResponse;
import com.example.JustEat.entity.Cart;
import com.example.JustEat.entity.CartItem;
import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.User;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.mapper.CartMapper;
import com.example.JustEat.repository.CartItemRepository;
import com.example.JustEat.repository.CartRepository;
import com.example.JustEat.repository.MenuItemRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService{
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
    @Override
    public CartResponse getCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));
        return CartMapper.toResponse(cart);
    }
    @Override
    public void addToCart(Long menuItemId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        User user = getCurrentUser();
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));
        Cart cart = cartRepository.findByUser(user)
                .orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setRestaurant(menuItem.getRestaurant());
            cart = cartRepository.save(cart);
        }
        if (cart.getRestaurant() != null &&
                !cart.getRestaurant().getId()
                        .equals(menuItem.getRestaurant().getId())) {

            cart.getItems().clear();
            cart.setRestaurant(menuItem.getRestaurant());
        }
        Optional<CartItem> existingItem =
                cartItemRepository.findByCartAndMenuItem(cart, menuItem);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setMenuItem(menuItem);
            item.setQuantity(quantity);
            item.setPrice(menuItem.getPrice());
            cart.getItems().add(item);
    }
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        cart.setTotalAmount(total);

        cartRepository.save(cart);
    }
    @Override
    public void removeItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Item not found"));
        Cart cart = item.getCart();
        cart.getItems().remove(item);
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        cart.setTotalAmount(total);

        cartRepository.save(cart);
    }
    @Override
    public void clearCart() {

        User user = getCurrentUser();

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));

        cart.getItems().clear();
        cart.setTotalAmount(0.0);

        cartRepository.save(cart);
    }
}