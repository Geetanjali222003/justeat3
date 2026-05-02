package com.example.JustEat.repository;

import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.entity.User;
import com.example.JustEat.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUser(User user);
    Optional<UserPreference> findByUserPublicId(UUID userPublicId);
    boolean existsByUser(User user);
    
    // Find all preferences that have this restaurant as favourite
    @Query("SELECT up FROM UserPreference up JOIN up.favouriteRestaurants r WHERE r = :restaurant")
    List<UserPreference> findByFavouriteRestaurantsContaining(@Param("restaurant") Restaurant restaurant);

    // Find all preferences that have this menu item as favourite
    @Query("SELECT up FROM UserPreference up JOIN up.favouriteFoods f WHERE f = :menuItem")
    List<UserPreference> findByFavouriteFoodsContaining(@Param("menuItem") MenuItem menuItem);
}
