-- Verify and Create Preferences Tables for JustEat
-- Run this script in PostgreSQL to ensure all tables exist

-- 1. Check if user_preference table exists and create if needed
CREATE TABLE IF NOT EXISTS user_preference (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    user_id BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_user_preference_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create favourite cuisines table
CREATE TABLE IF NOT EXISTS user_preference_favourite_cuisines (
    user_preference_id BIGINT NOT NULL,
    cuisine_type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_cuisines_preference FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE
);

-- 3. Create dietary restrictions table
CREATE TABLE IF NOT EXISTS user_preference_dietary_restrictions (
    user_preference_id BIGINT NOT NULL,
    dietary_restriction VARCHAR(50) NOT NULL,
    CONSTRAINT fk_dietary_preference FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE
);

-- 4. Create favourite restaurants table
CREATE TABLE IF NOT EXISTS user_preference_favourite_restaurants (
    user_preference_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    PRIMARY KEY (user_preference_id, restaurant_id),
    CONSTRAINT fk_fav_restaurants_preference FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_restaurants_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE
);

-- 5. Create favourite foods table
CREATE TABLE IF NOT EXISTS user_preference_favourite_foods (
    user_preference_id BIGINT NOT NULL,
    food_id BIGINT NOT NULL,
    PRIMARY KEY (user_preference_id, food_id),
    CONSTRAINT fk_fav_foods_preference FOREIGN KEY (user_preference_id) REFERENCES user_preference(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_foods_menu_item FOREIGN KEY (food_id) REFERENCES menu_item(id) ON DELETE CASCADE
);

-- Verify tables exist
SELECT
    'user_preference' as table_name,
    COUNT(*) as record_count
FROM user_preference
UNION ALL
SELECT
    'user_preference_favourite_cuisines',
    COUNT(*)
FROM user_preference_favourite_cuisines
UNION ALL
SELECT
    'user_preference_dietary_restrictions',
    COUNT(*)
FROM user_preference_dietary_restrictions
UNION ALL
SELECT
    'user_preference_favourite_restaurants',
    COUNT(*)
FROM user_preference_favourite_restaurants
UNION ALL
SELECT
    'user_preference_favourite_foods',
    COUNT(*)
FROM user_preference_favourite_foods;

-- Query to check a user's preferences
-- Replace <user_id> with actual user ID
-- SELECT
--     up.id,
--     u.email,
--     COALESCE(array_agg(DISTINCT upc.cuisine_type) FILTER (WHERE upc.cuisine_type IS NOT NULL), '{}') as cuisines,
--     COALESCE(array_agg(DISTINCT upd.dietary_restriction) FILTER (WHERE upd.dietary_restriction IS NOT NULL), '{}') as dietary
-- FROM user_preference up
-- JOIN users u ON up.user_id = u.id
-- LEFT JOIN user_preference_favourite_cuisines upc ON up.id = upc.user_preference_id
-- LEFT JOIN user_preference_dietary_restrictions upd ON up.id = upd.user_preference_id
-- WHERE u.id = <user_id>
-- GROUP BY up.id, u.email;

