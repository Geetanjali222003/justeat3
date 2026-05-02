-- JustEat Preferences Diagnostic Queries
-- Run these queries to diagnose preference issues

-- ==========================================
-- 1. CHECK IF TABLES EXIST
-- ==========================================
SELECT
    table_name,
    CASE
        WHEN table_name IN (
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
        ) THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END as status
FROM (
    VALUES
        ('user_preference'),
        ('user_preference_favourite_cuisines'),
        ('user_preference_dietary_restrictions'),
        ('user_preference_favourite_restaurants'),
        ('user_preference_favourite_foods')
) AS tables(table_name);

-- ==========================================
-- 2. COUNT RECORDS IN EACH TABLE
-- ==========================================
SELECT 'user_preference' as table_name, COUNT(*) as count FROM user_preference
UNION ALL
SELECT 'favourite_cuisines', COUNT(*) FROM user_preference_favourite_cuisines
UNION ALL
SELECT 'dietary_restrictions', COUNT(*) FROM user_preference_dietary_restrictions
UNION ALL
SELECT 'favourite_restaurants', COUNT(*) FROM user_preference_favourite_restaurants
UNION ALL
SELECT 'favourite_foods', COUNT(*) FROM user_preference_favourite_foods;

-- ==========================================
-- 3. VIEW ALL USER PREFERENCES
-- ==========================================
SELECT
    u.id as user_id,
    u.email,
    u.username,
    u.role,
    up.id as preference_id,
    CASE WHEN up.id IS NOT NULL THEN '✓' ELSE '✗' END as has_preferences
FROM users u
LEFT JOIN user_preference up ON u.id = up.user_id
WHERE u.role = 'CUSTOMER'
ORDER BY u.email;

-- ==========================================
-- 4. DETAILED PREFERENCE VIEW FOR A USER
-- Replace <USER_EMAIL> with actual email
-- ==========================================
-- SELECT
--     u.email,
--     up.id as preference_id,
--     COALESCE(
--         (SELECT array_agg(cuisine_type)
--          FROM user_preference_favourite_cuisines
--          WHERE user_preference_id = up.id),
--         ARRAY[]::VARCHAR[]
--     ) as cuisines,
--     COALESCE(
--         (SELECT array_agg(dietary_restriction)
--          FROM user_preference_dietary_restrictions
--          WHERE user_preference_id = up.id),
--         ARRAY[]::VARCHAR[]
--     ) as dietary,
--     COALESCE(
--         (SELECT COUNT(*)
--          FROM user_preference_favourite_restaurants
--          WHERE user_preference_id = up.id),
--         0
--     ) as fav_restaurant_count,
--     COALESCE(
--         (SELECT COUNT(*)
--          FROM user_preference_favourite_foods
--          WHERE user_preference_id = up.id),
--         0
--     ) as fav_food_count
-- FROM users u
-- LEFT JOIN user_preference up ON u.id = up.user_id
-- WHERE u.email = '<USER_EMAIL>';

-- ==========================================
-- 5. CHECK FOR ORPHANED PREFERENCES
-- ==========================================
SELECT
    'Orphaned Preferences' as issue,
    COUNT(*) as count
FROM user_preference up
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = up.user_id
);

-- ==========================================
-- 6. FIND USERS WITH MOST PREFERENCES
-- ==========================================
SELECT
    u.email,
    up.id as pref_id,
    (SELECT COUNT(*) FROM user_preference_favourite_cuisines WHERE user_preference_id = up.id) as cuisine_count,
    (SELECT COUNT(*) FROM user_preference_dietary_restrictions WHERE user_preference_id = up.id) as dietary_count,
    (SELECT COUNT(*) FROM user_preference_favourite_restaurants WHERE user_preference_id = up.id) as restaurant_count,
    (SELECT COUNT(*) FROM user_preference_favourite_foods WHERE user_preference_id = up.id) as food_count
FROM users u
JOIN user_preference up ON u.id = up.user_id
ORDER BY cuisine_count + dietary_count + restaurant_count + food_count DESC
LIMIT 10;

-- ==========================================
-- 7. CHECK MENU ITEMS BY DIETARY TYPE
-- ==========================================
SELECT
    dietary_restriction,
    COUNT(*) as item_count
FROM menu_item
WHERE is_available = true
GROUP BY dietary_restriction
ORDER BY item_count DESC;

-- ==========================================
-- 8. VERIFY FOREIGN KEY CONSTRAINTS
-- ==========================================
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name LIKE 'user_preference%'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- ==========================================
-- 9. RECENT PREFERENCE UPDATES
-- ==========================================
SELECT
    u.email,
    up.id as pref_id,
    up.created_at,
    up.updated_at,
    EXTRACT(EPOCH FROM (NOW() - up.updated_at))/60 as minutes_ago
FROM user_preference up
JOIN users u ON up.user_id = u.id
ORDER BY up.updated_at DESC
LIMIT 10;

-- ==========================================
-- 10. TEST DATA CLEANUP (USE CAREFULLY!)
-- ==========================================
-- Uncomment to delete all preferences for testing
-- DELETE FROM user_preference_favourite_foods;
-- DELETE FROM user_preference_favourite_restaurants;
-- DELETE FROM user_preference_dietary_restrictions;
-- DELETE FROM user_preference_favourite_cuisines;
-- DELETE FROM user_preference;

