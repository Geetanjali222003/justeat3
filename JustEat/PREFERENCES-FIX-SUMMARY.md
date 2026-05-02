# User Preferences Feature - Implementation Summary

## ✅ What Was Fixed

### 1. **Database Schema Issues**
- **Fixed:** Column names in ElementCollection tables
  - Changed from `favourite_cuisines` to `cuisine_type`
  - Changed from `dietary_restrictions` to `dietary_restriction`
- **Added:** Proper cascade types for ManyToMany relationships
- **Created:** SQL script to verify/create all required tables

### 2. **Entity Mapping (UserPreference.java)**
```java
// BEFORE (Wrong)
@Column(name = "favourite_cuisines")
private List<CuisineType> favouriteCuisines;

// AFTER (Correct)
@Column(name = "cuisine_type")
private List<CuisineType> favouriteCuisines;
```

### 3. **Service Layer (PreferenceServiceImpl.java)**
**Enhanced with:**
- ✅ Detailed logging at every step
- ✅ Explicit `saveAndFlush()` for immediate persistence
- ✅ Better transaction management with `@Transactional`
- ✅ Try-catch with detailed error messages
- ✅ Save new preference immediately to get ID before adding collections
- ✅ Clear collections before adding new items to avoid duplicates

**Key Changes:**
```java
// Save immediately to get ID
UserPreference newPref = new UserPreference();
newPref.setUser(user);
return preferenceRepository.save(newPref); // Get ID first

// Then add collections
preference.getFavouriteCuisines().clear();
preference.getFavouriteCuisines().addAll(request.getFavouriteCuisines());

// Use saveAndFlush for immediate persistence
UserPreference saved = preferenceRepository.saveAndFlush(preference);
```

### 4. **Restaurant Sorting Logic**
Restaurants are now sorted by:
1. **Favorite restaurants first**
2. **Cuisine match count** (more matches = higher priority)
3. **Rating** (highest rated)

### 5. **Menu Filtering Logic**
Menu items are filtered based on user's dietary restrictions:
- If user has VEG restriction → only VEG items shown
- If user has NON_VEG restriction → only NON_VEG items shown
- If user has VEGAN restriction → only VEGAN items shown
- No preferences → all items shown

---

## 📋 Database Tables

### Tables Created/Fixed:
1. **user_preference** - Main preferences table
2. **user_preference_favourite_cuisines** - Stores cuisine preferences
3. **user_preference_dietary_restrictions** - Stores dietary restrictions  
4. **user_preference_favourite_restaurants** - Links to favorite restaurants
5. **user_preference_favourite_foods** - Links to favorite menu items

### Schema Verification:
Run: `Backend/verify-preferences-schema.sql`

---

## 🔧 Files Modified

### Backend:
1. **UserPreference.java** - Fixed column names and added cascade types
2. **PreferenceServiceImpl.java** - Enhanced saving logic and logging
3. **RestaurantServiceImpl.java** - Added sorting by preferences
4. **CustomerController.java** - Already has menu filtering logic

### Frontend:
No changes needed - already correctly implemented in `Preferences.jsx`

---

## 🧪 Testing Checklist

### Database:
- [ ] Run `verify-preferences-schema.sql` to create tables
- [ ] Run `diagnostic-preferences.sql` to verify setup
- [ ] Check table counts are correct

### Backend:
- [ ] Backend running on port 8090
- [ ] No errors in console logs
- [ ] POST /customer/preferences returns 201
- [ ] GET /customer/preferences returns data or empty object

### Frontend:
- [ ] Can navigate to Preferences page
- [ ] Can select cuisines (checkboxes)
- [ ] Can select dietary restrictions (checkboxes)
- [ ] Can select favorite restaurants (buttons)
- [ ] Can select favorite foods (buttons)
- [ ] Save button works without errors
- [ ] Success message appears
- [ ] Redirects to home after save

### Integration:
- [ ] Home page shows favorite restaurants first
- [ ] Restaurant menu filters by dietary restrictions
- [ ] Recommendations work correctly
- [ ] Preferences persist after logout/login

---

## 🚀 How to Test

### Step 1: Database Setup
```sql
-- Connect to PostgreSQL
psql -U postgres -d justeat2

-- Run verification script
\i Backend/verify-preferences-schema.sql

-- Run diagnostics
\i Backend/diagnostic-preferences.sql
```

### Step 2: Start Backend
```bash
cd Backend
.\mvnw.cmd spring-boot:run
```

### Step 3: Start Frontend
```bash
cd Frontend/JustEat_frontend
npm run dev
```

### Step 4: Test Flow
1. Login as CUSTOMER
2. Navigate to Preferences
3. Select: Indian cuisine, VEG dietary restriction
4. Save preferences
5. Go to home page
6. Click on any restaurant
7. **Expected:** Only VEG items visible in menu

---

## 🐛 Troubleshooting

### Issue: "Failed to save preferences"
**Check:**
1. Backend logs for detailed error
2. Run diagnostic queries to check tables exist
3. Verify user has CUSTOMER role

**Solution:**
```bash
# Restart backend with logging
cd Backend
.\mvnw.cmd spring-boot:run

# Watch logs for: "=== Saving preferences for user: {uuid} ==="
```

### Issue: Preferences not persisting
**Check database:**
```sql
-- Check if record created
SELECT * FROM user_preference ORDER BY updated_at DESC LIMIT 5;

-- Check cuisines saved
SELECT * FROM user_preference_favourite_cuisines;

-- Check dietary saved
SELECT * FROM user_preference_dietary_restrictions;
```

**If tables are empty:**
- Check backend logs for transaction rollback
- Verify foreign key constraints exist
- Check user_id matches existing user

### Issue: Menu not filtering
**Check:**
1. Preferences saved in DB
2. User logged in with valid token
3. CustomerController has filtering logic

**Verify filtering:**
```sql
-- Check if user has preferences
SELECT u.email, up.id, 
    (SELECT array_agg(dietary_restriction) 
     FROM user_preference_dietary_restrictions 
     WHERE user_preference_id = up.id)
FROM users u
JOIN user_preference up ON u.id = up.user_id
WHERE u.email = 'your@email.com';
```

---

## 📊 Expected Behavior

### Scenario 1: VEG User
1. User sets dietary restriction = VEG
2. Visits restaurant menu
3. **Result:** Only items with `dietary_restriction = 'VEG'` shown

### Scenario 2: Multiple Cuisines
1. User selects: INDIAN, CHINESE
2. Views restaurant list
3. **Result:** Restaurants with INDIAN/CHINESE cuisines appear first

### Scenario 3: No Preferences
1. User doesn't set preferences
2. Views app normally
3. **Result:** All restaurants and items shown, no filtering

---

## 🔍 Monitoring

### Check Backend Logs:
Look for these log messages:
```
✅ "=== Saving preferences for user: {uuid} ==="
✅ "User found: {email} (ID: {id})"
✅ "Preference entity ID: {id}"
✅ "Setting 2 favourite cuisines: [INDIAN, CHINESE]"
✅ "Setting 1 dietary restrictions: [VEG]"
✅ "=== Preferences saved successfully with ID: {id} ==="
```

### Check for Errors:
```
❌ "Error saving preferences: {message}"
❌ "User not found"
❌ "Failed to save preferences"
```

---

## 📝 API Endpoints

### Save Preferences
```
POST /customer/preferences
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "favouriteCuisines": ["INDIAN", "CHINESE"],
  "dietaryRestrictions": ["VEG"],
  "restaurantIds": ["uuid1", "uuid2"],
  "foodIds": [1, 2, 3]
}
```

### Get Preferences
```
GET /customer/preferences
Authorization: Bearer {jwt_token}
```

### Get Recommendations
```
GET /customer/recommendations/{userId}
Authorization: Bearer {jwt_token}
```

---

## ✨ Success Indicators

You know it's working when:
1. ✅ No errors in backend console
2. ✅ POST request returns 201 with preference data
3. ✅ Database tables have records
4. ✅ Menu items filtered correctly
5. ✅ Favorite restaurants appear first on home page
6. ✅ GET request returns saved preferences
7. ✅ Frontend shows success message

---

## 📚 Additional Resources

- **Testing Guide:** See `PREFERENCES-TESTING-GUIDE.md`
- **Diagnostic Queries:** Run `diagnostic-preferences.sql`
- **Schema Setup:** Run `verify-preferences-schema.sql`

---

## 🎯 Next Steps

1. Run the SQL scripts to verify database schema
2. Restart the backend application
3. Test the preferences flow end-to-end
4. Monitor logs for any errors
5. Check database to confirm data persistence

If preferences are still not saving after these steps, share the backend logs and we'll debug further!

