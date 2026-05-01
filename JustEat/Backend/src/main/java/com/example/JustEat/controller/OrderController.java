package com.example.JustEat.controller;

import com.example.JustEat.entity.Order;
import com.example.JustEat.service.OrderService;

import lombok.RequiredArgsConstructor;
import com.example.JustEat.enums.OrderStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import com.example.JustEat.dto.response.OrderResponse;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder() {
        return ResponseEntity.ok(orderService.placeOrder());
    }
    @GetMapping("/history")
    public ResponseEntity<List<OrderResponse>> getHistory() {
        return ResponseEntity.ok(orderService.getOrderHistory());
    }
    @PostMapping("/reorder/{publicId}")
    public ResponseEntity<String> reorder(@PathVariable UUID publicId) {
        orderService.reorder(publicId);
        return ResponseEntity.ok("Reordered successfully");
    }
    @PutMapping("/{publicId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID publicId,
            @RequestParam OrderStatus status
    ) {
        orderService.updateStatus(publicId, status);
        return ResponseEntity.ok("Status updated");
    }
    @GetMapping("/owner")
    public ResponseEntity<List<OrderResponse>> getOwnerOrders() {
        return ResponseEntity.ok(orderService.getOwnerOrders());
    }
    @GetMapping("/{publicId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID publicId) {
        return ResponseEntity.ok(orderService.getOrder(publicId));
    }

}