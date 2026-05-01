package com.example.JustEat.dto.response;

import com.example.JustEat.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {

    private UUID publicId;
    private String restaurantName;
    private Double totalAmount;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private String customerName;  // For owner dashboard
    private String customerEmail; // For owner dashboard
}