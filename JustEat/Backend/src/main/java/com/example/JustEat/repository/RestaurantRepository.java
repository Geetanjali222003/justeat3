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
    
    // Queries with eager fetch for cuisineTypes to avoid LazyInitializationException
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.location = :location AND r.status = :status")
    List<Restaurant> findByLocationAndStatus(@Param("location") Location location, @Param("status") RestaurantStatus status);
    
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.status = :status")
    List<Restaurant> findByStatus(@Param("status") RestaurantStatus status);
    
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.publicId = :publicId")
    Optional<Restaurant> findByPublicId(@Param("publicId") UUID publicId);
    
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.owner.publicId = :ownerPublicId")
    List<Restaurant> findByOwnerPublicId(@Param("ownerPublicId") UUID ownerPublicId);
    
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.owner.id = :ownerId")
    List<Restaurant> findByOwnerId(@Param("ownerId") Long ownerId);
    
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.publicId IN :publicIds")
    List<Restaurant> findByPublicIdIn(@Param("publicIds") List<UUID> publicIds);

    // Find restaurants by cuisine types for recommendations
    @Query("SELECT DISTINCT r FROM Restaurant r JOIN r.cuisineTypes c WHERE c IN :cuisines AND r.status = 'OPEN'")
    List<Restaurant> findByCuisineTypesIn(@Param("cuisines") List<CuisineType> cuisines);

    // Search owner's restaurants by keyword (name or location)
    @Query("SELECT DISTINCT r FROM Restaurant r LEFT JOIN FETCH r.cuisineTypes WHERE r.owner.publicId = :ownerPublicId " +
           "AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(CAST(r.location AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> searchByOwnerAndKeyword(@Param("ownerPublicId") UUID ownerPublicId, 
                                              @Param("keyword") String keyword);
}
