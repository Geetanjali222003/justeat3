package com.example.JustEat.service;

import com.example.JustEat.dto.response.OrderResponse;
import com.example.JustEat.entity.*;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.OrderStatus;
import com.example.JustEat.enums.Role;
import com.example.JustEat.exception.NotFoundException;
import com.example.JustEat.repository.CartRepository;
import com.example.JustEat.repository.OrderRepository;
import com.example.JustEat.repository.UserRepository;
import com.example.JustEat.service.Impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Tests")
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CartRepository cartRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartService cartService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User user;
    private Restaurant restaurant;
    private Cart cart;
    private MenuItem menuItem;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = new User();
        user.setId(1L);
        user.setPublicId(userId);
        user.setEmail("customer@example.com");
        user.setRole(Role.CUSTOMER);
        user.setLocation(Location.NOIDA);

        restaurant = new Restaurant();
        restaurant.setId(1L);
        restaurant.setPublicId(UUID.randomUUID());
        restaurant.setName("Test Restaurant");

        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setName("Pizza");
        menuItem.setPrice(12.0);
        menuItem.setRestaurant(restaurant);

        cart = new Cart();
        cart.setId(1L);
        cart.setUser(user);
        cart.setRestaurant(restaurant);
        cart.setTotalAmount(24.0);
        cart.setItems(new ArrayList<>());

        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(cart);
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(2);
        cartItem.setPrice(12.0);
        cart.getItems().add(cartItem);

        // Mock SecurityContextHolder
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(userId.toString());
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByPublicId(userId)).thenReturn(Optional.of(user));
    }

    // ==================== placeOrder ====================

    @Test
    @DisplayName("placeOrder - should throw NotFoundException if cart is empty")
    void placeOrder_noCart_throwsNotFoundException() {
        when(cartRepository.findByUser(user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.placeOrder())
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Cart");
    }

    @Test
    @DisplayName("placeOrder - should throw IllegalStateException if cart has no items")
    void placeOrder_emptyCartItems_throwsIllegalStateException() {
        cart.getItems().clear();
        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() -> orderService.placeOrder())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("empty cart");
    }

    @Test
    @DisplayName("placeOrder - should create order and clear cart on success")
    void placeOrder_validCart_createsOrderAndClearsCart() {
        Order savedOrder = new Order();
        savedOrder.setId(1L);
        savedOrder.setPublicId(UUID.randomUUID());
        savedOrder.setUser(user);
        savedOrder.setRestaurant(restaurant);
        savedOrder.setStatus(OrderStatus.PENDING);
        savedOrder.setTotalAmount(24.0);
        savedOrder.setItems(new ArrayList<>());

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderResponse response = orderService.placeOrder();

        assertThat(response).isNotNull();
        verify(cartService).clearCart();
        verify(orderRepository).save(any(Order.class));
    }

    // ==================== getOrderHistory ====================

    @Test
    @DisplayName("getOrderHistory - should return empty list when no orders")
    void getOrderHistory_noOrders_returnsEmptyList() {
        when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of());

        List<OrderResponse> history = orderService.getOrderHistory();

        assertThat(history).isEmpty();
    }

    @Test
    @DisplayName("getOrderHistory - should return list of order responses")
    void getOrderHistory_withOrders_returnsMappedResponses() {
        Order order = new Order();
        order.setId(1L);
        order.setPublicId(UUID.randomUUID());
        order.setUser(user);
        order.setRestaurant(restaurant);
        order.setStatus(OrderStatus.COMPLETED);
        order.setTotalAmount(24.0);
        order.setItems(new ArrayList<>());

        when(orderRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(order));

        List<OrderResponse> history = orderService.getOrderHistory();

        assertThat(history).hasSize(1);
    }
}

