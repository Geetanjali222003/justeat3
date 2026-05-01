package com.example.JustEat.service.Impl;
import java.util.List;
import com.example.JustEat.dto.response.OrderResponse;
import com.example.JustEat.entity.Cart;
import com.example.JustEat.entity.CartItem;
import com.example.JustEat.entity.Order;
import com.example.JustEat.entity.OrderItem;
import com.example.JustEat.entity.User;
import com.example.JustEat.enums.OrderStatus;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.CartRepository;
import com.example.JustEat.repository.OrderRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.CartService;
import com.example.JustEat.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.JustEat.mapper.OrderMapper;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    private User getCurrentUser() {
        String userIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID userId = UUID.fromString(userIdStr);
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    @Transactional
    public OrderResponse placeOrder() {
        User user = getCurrentUser();

        // Get user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot place order with empty cart");
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setRestaurant(cart.getRestaurant());

        order.setStatus(OrderStatus.PENDING);

        order.setTotalAmount(cart.getTotalAmount());

        // Convert cart items to order items
        order.setItems(cart.getItems().stream()
                .map(cartItem -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setMenuItem(cartItem.getMenuItem());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setPrice(cartItem.getPrice());
                    return orderItem;
                })
                .collect(Collectors.toList()));

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartService.clearCart();

        return OrderMapper.toResponse(savedOrder);
    }
    @Override
    public List<OrderResponse> getOrderHistory() {

        User user = getCurrentUser();

        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(OrderMapper::toResponse)
                .toList();
    }
    @Override
    public void reorder(UUID publicId) {

        User user = getCurrentUser();

        // 🔍 get order
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 🛒 get or create cart
        Cart cart = cartRepository.findByUser(user)
                .orElse(null);

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
        }

        // 🔥 enforce single restaurant rule
        cart.setRestaurant(order.getRestaurant());

        // 🧹 clear old cart
        cart.getItems().clear();

        // 🔁 copy items
        for (OrderItem orderItem : order.getItems()) {

            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setMenuItem(orderItem.getMenuItem());
            cartItem.setQuantity(orderItem.getQuantity());
            cartItem.setPrice(orderItem.getPrice());

            cart.getItems().add(cartItem);
        }

        // 💰 recalculate total
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        cart.setTotalAmount(total);

        cartRepository.save(cart);
    }
    @Override
    public OrderResponse getOrder(UUID publicId) {

        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        return OrderMapper.toResponse(order);
    }

    @Override
    public List<OrderResponse> getOwnerOrders() {
        User owner = getCurrentUser();

        // Find all restaurants owned by this user
        // Then find all orders for those restaurants
        List<Order> orders = orderRepository.findByRestaurant_OwnerId(owner.getId());

        return orders.stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    @Override
    public void updateStatus(UUID publicId, OrderStatus status) {

        User owner = getCurrentUser();

        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // 🔐 SECURITY CHECK - verify the order's restaurant belongs to this owner
        if (!order.getRestaurant().getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Not allowed to update this order");
        }

        order.setStatus(status);

        orderRepository.save(order);
    }
}