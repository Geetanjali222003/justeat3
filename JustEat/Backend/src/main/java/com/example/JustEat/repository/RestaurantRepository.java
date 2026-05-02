package com.example.JustEat.repository;

import com.example.JustEat.entity.Restaurant;
import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByLocationAndStatus(Location location, RestaurantStatus status);
    List<Restaurant> findByStatus(RestaurantStatus status);
    Optional<Restaurant> findByPublicId(UUID publicId);
    List<Restaurant> findByOwnerPublicId(UUID ownerPublicId);
    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByPublicIdIn(List<UUID> publicIds);

    // Find restaurants by cuisine types for recommendations
    @Query("SELECT DISTINCT r FROM Restaurant r JOIN r.cuisineTypes c WHERE c IN :cuisines AND r.status = 'OPEN'")
    List<Restaurant> findByCuisineTypesIn(@Param("cuisines") List<CuisineType> cuisines);

    // Search owner's restaurants by keyword (name or location)
    @Query("SELECT r FROM Restaurant r WHERE r.owner.publicId = :ownerPublicId " +
           "AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(CAST(r.location AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> searchByOwnerAndKeyword(@Param("ownerPublicId") UUID ownerPublicId, 
                                              @Param("keyword") String keyword);
}
