package com.example.JustEat.repository;

import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUser(User user);
    Optional<UserPreference> findByUserPublicId(UUID userPublicId);
    boolean existsByUser(User user);
}

