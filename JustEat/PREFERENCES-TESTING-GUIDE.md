# JustEat User Preferences - Testing Guide

## Overview
User preferences have been implemented to allow customers to:
- Save favorite cuisines (e.g., INDIAN, CHINESE, ITALIAN)
- Set dietary restrictions (VEG, NON_VEG, VEGAN)
- Mark favorite restaurants
- Mark favorite foods
- Get personalized recommendations
- See filtered menu items based on dietary preferences

---

## Database Schema

### Tables Created:
1. **user_preference** - Main table (one-to-one with users)
2. **user_preference_favourite_cuisines** - Stores cuisine preferences
3. **user_preference_dietary_restrictions** - Stores dietary restrictions
4. **user_preference_favourite_restaurants** - Many-to-many with restaurants
5. **user_preference_favourite_foods** - Many-to-many with menu_items

### Verify Schema:
Run the SQL script: `verify-preferences-schema.sql`

---

## Backend Endpoints

### 1. Save Preferences
**Endpoint:** `POST /customer/preferences`  
**Auth Required:** Yes (CUSTOMER role)  
**Request Body:**
```json
{
  "favouriteCuisines": ["INDIAN", "CHINESE"],
  "dietaryRestrictions": ["VEG"],
  "restaurantIds": ["uuid1", "uuid2"],
  "foodIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "id": 1,
  "userId": "user-uuid",
  "favouriteCuisines": ["INDIAN", "CHINESE"],
  "dietaryRestrictions": ["VEG"],
  "favouriteRestaurants": [...],
  "favouriteFoods": [...]
}
```

---

### 2. Get Current User Preferences
**Endpoint:** `GET /customer/preferences`  
**Auth Required:** Yes (CUSTOMER role)  

**Response:** Same as save response, or empty preferences if none exist.

---

### 3. Get Recommendations
**Endpoint:** `GET /customer/recommendations/{userId}`  
**Auth Required:** Yes (CUSTOMER role)  

**Response:**
```json
{
  "recommendedRestaurants": [...],
  "recommendedFoods": [...]
}
```

**Logic:**
- Shows favorite restaurants first
- Then restaurants matching favorite cuisines
- Shows favorite foods first
- Then foods matching cuisines and dietary restrictions
- Limited to 10 each

---

### 4. Get Specials & Deals
**Endpoint:** `GET /customer/specials`  
**Auth Required:** Yes (CUSTOMER role)  

Returns foods marked as special or deal of the day.

---

## Filtering Logic

### Restaurant List (`GET /customer/restaurants`)
When a user has preferences, restaurants are sorted by:
1. **Favorite restaurants first**
2. **Cuisine match** (restaurants with matching cuisines)
3. **Rating** (highest rated)

### Menu Items (`GET /customer/restaurants/{publicId}/menu`)
When a user has dietary restrictions:
- **VEG users** - See only VEG items
- **NON_VEG users** - See only NON_VEG items
- **VEGAN users** - See only VEGAN items
- **No preferences** - See all items

---

## Testing Steps

### Step 1: Verify Backend is Running
```bash
# Check if Spring Boot is running on port 8090
curl http://localhost:8090/customer/restaurants
```

### Step 2: Login as Customer
1. Go to `http://localhost:5174/login`
2. Login with customer credentials
3. Copy JWT token from browser localStorage

### Step 3: Test Preferences Page
1. Click "Preferences" in navbar
2. Select cuisines (e.g., Indian, Chinese)
3. Select dietary restrictions (e.g., VEG)
4. Select favorite restaurants (click buttons)
5. Select favorite foods (scroll and click)
6. Click "Save Preferences"
7. Should see success message

### Step 4: Verify in Database
```sql
-- Check if preferences saved
SELECT * FROM user_preference WHERE user_id = <your_user_id>;

-- Check cuisines
SELECT * FROM user_preference_favourite_cuisines 
WHERE user_preference_id = <preference_id>;

-- Check dietary restrictions
SELECT * FROM user_preference_dietary_restrictions 
WHERE user_preference_id = <preference_id>;
```

### Step 5: Test Filtering
1. Go to home page (`/`)
2. **Expected:** Favorite restaurants appear first
3. Click on a restaurant
4. **Expected:** Menu shows only items matching dietary restrictions

### Step 6: Test Recommendations
Navigate to home and check if personalized recommendations appear.

---

## Troubleshooting

### Issue: Preferences not saving
**Check:**
1. Backend logs for errors: `ERROR.*Preference`
2. Database connection
3. JWT token is valid
4. User has CUSTOMER role

**Solution:**
```bash
# Restart backend
cd Backend
.\mvnw.cmd spring-boot:run
```

### Issue: 500 Error on GET /customer/preferences
**Cause:** Database schema mismatch or entity mapping issue

**Solution:**
1. Run `verify-preferences-schema.sql`
2. Check if tables exist
3. Verify foreign key constraints

### Issue: Menu not filtering by dietary restrictions
**Cause:** Preferences not loaded or filtering logic issue

**Solution:**
1. Check if preferences exist in DB
2. Verify `CustomerController.getRestaurantMenu()` logic
3. Check browser console for API errors

---

## Code Changes Summary

### Modified Files:

1. **UserPreference.java**
   - Fixed column names for ElementCollections
   - Added cascade types for proper persistence

2. **PreferenceServiceImpl.java**
   - Enhanced logging
   - Added explicit `saveAndFlush()`
   - Better error handling
   - Fixed transaction management

3. **RestaurantServiceImpl.java**
   - Implemented restaurant sorting by preferences
   - Prioritizes favorite restaurants and cuisine matches

4. **CustomerController.java**
   - Implements menu filtering by dietary restrictions
   - Filters menu items based on user preferences

---

## Expected Behavior

### When User is VEG:
- Home page shows VEG-friendly restaurants first
- Menu pages show ONLY VEG items
- Recommendations include VEG items

### When User is NON_VEG:
- Shows NON_VEG items only

### When User is VEGAN:
- Shows VEGAN items only

### No Preferences Set:
- Shows all restaurants
- Shows all menu items
- No filtering applied

---

## API Testing with Postman

### Save Preferences
```
POST http://localhost:8090/customer/preferences
Headers:
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json

Body:
{
  "favouriteCuisines": ["INDIAN"],
  "dietaryRestrictions": ["VEG"],
  "restaurantIds": [],
  "foodIds": []
}
```

### Get Preferences
```
GET http://localhost:8090/customer/preferences
Headers:
  Authorization: Bearer <your_jwt_token>
```

---

## Notes

1. **Preferences are optional** - If user doesn't set preferences, app works normally
2. **Real-time filtering** - Preferences apply immediately after saving
3. **Multiple selections** - Users can select multiple cuisines and restrictions
4. **Persistence** - Preferences stored in PostgreSQL with proper relationships
5. **Security** - Only authenticated CUSTOMER users can access preferences

---

## Success Criteria

✅ User can save preferences without errors  
✅ Preferences persist in database  
✅ Restaurant list shows favorites first  
✅ Menu items filtered by dietary restrictions  
✅ Recommendations show relevant items  
✅ No 500 errors on any preference endpoint  
✅ Frontend shows loading states properly  
✅ Success/error messages displayed correctly  

---

## Support

If issues persist:
1. Check backend logs for detailed error messages
2. Verify database schema matches entity definitions
3. Ensure JWT token is valid and user has CUSTOMER role
4. Clear browser cache and localStorage
5. Restart both frontend and backend services

