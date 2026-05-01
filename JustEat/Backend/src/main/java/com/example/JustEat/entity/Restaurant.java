package com.example.JustEat.entity;

import com.example.JustEat.enums.CuisineType;
import com.example.JustEat.enums.Location;
import com.example.JustEat.enums.RestaurantStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="restaurants")
@Getter
@Setter
public class Restaurant extends BaseEntity{

    @Column(nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @NotBlank(message = "Restaurant name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull(message = "Location is required")
    @Enumerated(EnumType.STRING)
    private Location location;

    @NotNull(message = "Cuisine type is required")
    @ElementCollection
    @CollectionTable(
            name = "restaurant_cuisines",
            joinColumns = @JoinColumn(name = "restaurant_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "cuisine")
    private List<CuisineType> cuisineTypes = new ArrayList<>();

    @NotBlank
    @Column(nullable = false)
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

    @NotNull(message = "Restaurant must have an owner")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private User owner;

    @NotNull
    @Enumerated(EnumType.STRING)
    private RestaurantStatus status = RestaurantStatus.OPEN;

    @OneToMany(mappedBy = "restaurant", fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<MenuItem> menuItems = new ArrayList<>();

    @PrePersist
    public void generatePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
    @Column(nullable = false)
    private Double rating =0.0;
    @Column(nullable = false)
    private Integer ratingCount=0;
}
