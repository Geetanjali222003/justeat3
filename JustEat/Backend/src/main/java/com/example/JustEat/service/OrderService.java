package com.example.JustEat.service;
import com.example.JustEat.enums.OrderStatus;
import com.example.JustEat.entity.Order;
import java.util.List;
import java.util.UUID;
import com.example.JustEat.dto.response.OrderResponse;

public interface OrderService {
    OrderResponse placeOrder();
    List<OrderResponse> getOrderHistory();
    void reorder(UUID publicId);
    OrderResponse getOrder(UUID publicId);
    List<OrderResponse> getOwnerOrders();
    void updateStatus(UUID publicId, OrderStatus status);
}