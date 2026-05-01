package com.example.JustEat.repository;

import com.example.JustEat.entity.Cart;
import com.example.JustEat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    void deleteByUser(User user);
}