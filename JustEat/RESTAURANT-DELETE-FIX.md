# Restaurant Deletion Foreign Key Constraint Fix

## 🔴 Problem

When trying to delete a restaurant, the following error occurred:

```
ERROR: update or delete on table "restaurants" violates foreign key constraint "fk2dqgbe1mplflf435rqr130ur4" on table "restaurant_ratings"
Detail: Key (id)=(4) is still referenced from table "restaurant_ratings".
```

**Root Cause:** The restaurant had related records in:
1. `restaurant_ratings` table
2. `menu_item` table  
3. `user_preference_favourite_restaurants` table (ManyToMany)
4. Potentially `orders` table

These foreign key constraints prevented deletion.

---

## ✅ Solution Implemented

### 1. **Added Cascade Delete to Restaurant Entity**

**File:** `Restaurant.java`

```java
@OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
@OrderBy("id ASC")
@JsonIgnore
private List<MenuItem> menuItems = new ArrayList<>();

@OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
@JsonIgnore
private List<RestaurantRating> ratings = new ArrayList<>();
```

**What this does:**
- When a restaurant is deleted, all its **menu items** are automatically deleted (cascade)
- When a restaurant is deleted, all its **ratings** are automatically deleted (cascade)
- `orphanRemoval = true` ensures that when items/ratings are removed from the list, they're deleted from DB

---

### 2. **Updated OwnerServiceImpl.deleteRestaurant()**

**File:** `OwnerServiceImpl.java`

Added logic to handle dependencies before deletion:

```java
@Override
@Transactional
public void deleteRestaurant(UUID ownerPublicId, UUID restaurantPublicId) {
    log.info("Deleting restaurant {} for owner {}", restaurantPublicId, ownerPublicId);
    
    Restaurant restaurant = restaurantRepository.findByPublicId(restaurantPublicId)
            .orElseThrow(() -> new NotFoundException("Restaurant not found"));
    
    // 1. Validate ownership
    if (!restaurant.getOwner().getPublicId().equals(ownerPublicId)) {
        throw new ForbiddenException("Not authorized to delete this restaurant");
    }
    
    // 2. Check if there are any orders (prevent deletion if orders exist)
    boolean hasOrders = orderRepository.existsByRestaurant(restaurant);
    if (hasOrders) {
        throw new BadRequestException("Cannot delete restaurant with existing orders. Please contact support for assistance.");
    }
    
    // 3. Remove restaurant from all user preferences
    List<UserPreference> preferences = preferenceRepository.findByFavouriteRestaurantsContaining(restaurant);
    for (UserPreference preference : preferences) {
        preference.getFavouriteRestaurants().remove(restaurant);
        preferenceRepository.save(preference);
    }
    
    // 4. Delete the restaurant (cascade deletes ratings and menu items)
    restaurantRepository.delete(restaurant);
    log.info("Restaurant {} deleted successfully", restaurantPublicId);
}
```

---

### 3. **Added Repository Methods**

#### OrderRepository.java
```java
// Check if restaurant has any orders
boolean existsByRestaurant(Restaurant restaurant);
```

#### UserPreferenceRepository.java
```java
// Find all preferences that have this restaurant as favourite
@Query("SELECT up FROM UserPreference up JOIN up.favouriteRestaurants r WHERE r = :restaurant")
List<UserPreference> findByFavouriteRestaurantsContaining(@Param("restaurant") Restaurant restaurant);
```

---

## 🎯 Deletion Flow

When deleting a restaurant, the system now:

1. **✅ Validates ownership** - Only the owner can delete
2. **✅ Checks for orders** - Prevents deletion if orders exist (historical data)
3. **✅ Removes from preferences** - Clears restaurant from all user favorites
4. **✅ Cascades deletions:**
   - Deletes all **ratings** (via cascade)
   - Deletes all **menu items** (via cascade)
   - Deletes cuisine type mappings (ElementCollection)
5. **✅ Deletes restaurant** - Finally removes the restaurant record

---

## 📊 Database Impact

### Tables Affected During Deletion:

| Table | Action |
|-------|--------|
| `restaurant_ratings` | **Deleted** (cascade) |
| `menu_item` | **Deleted** (cascade) |
| `restaurant_cuisines` | **Deleted** (ElementCollection cascade) |
| `user_preference_favourite_restaurants` | **Cleaned** (restaurant removed from junction table) |
| `orders` | **Protected** (prevents deletion if exist) |
| `restaurants` | **Deleted** |

---

## ⚠️ Business Rules

### Can Delete Restaurant When:
- ✅ Owner is the actual owner
- ✅ No orders exist for the restaurant
- ✅ Has menu items (will be cascade deleted)
- ✅ Has ratings (will be cascade deleted)
- ✅ Is in user preferences (will be removed)

### Cannot Delete Restaurant When:
- ❌ Not the owner (403 Forbidden)
- ❌ Has existing orders (400 Bad Request)
  - **Reason:** Orders are historical records that must be preserved
  - **Solution:** Contact support for manual archival

---

## 🧪 Testing

### Test Case 1: Delete Restaurant Without Orders
**Setup:**
- Restaurant has menu items
- Restaurant has ratings
- Restaurant is in some user preferences

**Expected:**
- ✅ 204 No Content
- ✅ Restaurant deleted from DB
- ✅ All ratings deleted
- ✅ All menu items deleted
- ✅ Removed from user preferences

### Test Case 2: Delete Restaurant With Orders
**Setup:**
- Restaurant has completed orders

**Expected:**
- ❌ 400 Bad Request
- ❌ Error: "Cannot delete restaurant with existing orders"
- ✅ Restaurant NOT deleted

### Test Case 3: Non-Owner Tries to Delete
**Setup:**
- User B tries to delete User A's restaurant

**Expected:**
- ❌ 403 Forbidden
- ❌ Error: "Not authorized to delete this restaurant"

---

## 📝 Postman Testing

### Delete Restaurant
```
DELETE {{baseUrl}}/owner/restaurants/{{restaurantId}}
Headers:
  Authorization: Bearer {{ownerToken}}

Success Response: 204 No Content

Error Responses:
- 403 Forbidden: Not the owner
- 404 Not Found: Restaurant doesn't exist
- 400 Bad Request: Has existing orders
```

---

## 🔍 SQL Verification

### Check if restaurant is deleted:
```sql
SELECT * FROM restaurants WHERE public_id = 'restaurant-uuid';
-- Should return 0 rows
```

### Check if ratings are deleted:
```sql
SELECT * FROM restaurant_ratings WHERE restaurant_id = <restaurant_id>;
-- Should return 0 rows
```

### Check if menu items are deleted:
```sql
SELECT * FROM menu_item WHERE restaurant_id = <restaurant_id>;
-- Should return 0 rows
```

### Check if removed from preferences:
```sql
SELECT * FROM user_preference_favourite_restaurants WHERE restaurant_id = <restaurant_id>;
-- Should return 0 rows
```

---

## ✅ Summary

### Changes Made:
1. ✅ Added cascade delete to Restaurant entity
2. ✅ Added order existence check
3. ✅ Added user preference cleanup
4. ✅ Added new repository methods
5. ✅ Proper error handling with meaningful messages

### Result:
- **Fixed:** Foreign key constraint violation
- **Protected:** Historical order data
- **Cleaned:** All related references
- **Secured:** Ownership validation
- **User-friendly:** Clear error messages

---

## 🎉 Status: FIXED

Restaurant deletion now works properly with:
- ✅ Cascade deletion of ratings and menu items
- ✅ Protection of order history
- ✅ Cleanup of user preferences
- ✅ Proper ownership validation
- ✅ Clear error messages

**Test it now in Postman!**

