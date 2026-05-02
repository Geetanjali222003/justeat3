package com.example.JustEat.repository;

import com.example.JustEat.entity.MenuItem;
import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.DietaryRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    List<MenuItem> findByRestaurant_Id(Long restaurantId);
    Optional<MenuItem> findById(Long id);
    List<MenuItem> findByRestaurant_PublicIdAndIsAvailableTrue(UUID publicId);

    // Find specials and deals
    @Query("SELECT m FROM MenuItem m WHERE (m.isSpecial = true OR m.isDealOfDay = true) AND m.isAvailable = true")
    List<MenuItem> findSpecialsAndDeals();

    // Find by cuisine types and dietary restrictions for recommendations
    @Query("SELECT m FROM MenuItem m WHERE m.isAvailable = true " +
           "AND (m.cuisineType IN :cuisines OR m.dietaryRestriction IN :dietary) " +
           "ORDER BY m.orderCount DESC")
    List<MenuItem> findByPreferences(@Param("cuisines") List<CuisineType> cuisines,
                                      @Param("dietary") List<DietaryRestriction> dietary);

    // Find by IDs
    List<MenuItem> findByIdIn(List<Long> ids);
}
