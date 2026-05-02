# Quick Testing Guide - Delete Features & Logout Confirmation

## 🚀 Quick Start

### Prerequisites:
- Backend running on http://localhost:8090
- Frontend running on http://localhost:5174
- Owner account with at least one restaurant
- Customer account for logout testing

---

## 📝 Test Scenarios

### ✅ Test 1: Delete Restaurant (Owner Dashboard)

**Steps:**
1. Login as OWNER
2. Navigate to Owner Dashboard (`/owner-dashboard`)
3. Locate a restaurant card
4. Scroll down to find "🗑️ Delete Restaurant" button (red outlined button below View/Manage)
5. Click "🗑️ Delete Restaurant"
6. **Expected**: Button changes to show two buttons:
   - "✓ Confirm Delete" (red filled button)
   - "Cancel" (gray outlined button)

**Test Case A - Cancel:**
7. Click "Cancel"
8. **Expected**: Buttons revert back to single "Delete Restaurant" button
9. Restaurant remains in the list

**Test Case B - Confirm:**
7. Click "✓ Confirm Delete"
8. **Expected**:
   - Loading state: "Deleting..."
   - Success toast: "{Restaurant Name} deleted successfully!"
   - Restaurant card disappears from the list
9. Refresh page
10. **Expected**: Restaurant still not visible (permanently deleted)

**Database Verification:**
```sql
-- Check restaurant is deleted
SELECT * FROM restaurant WHERE public_id = '<restaurant_uuid>';
-- Should return 0 rows

-- Check menu items are also deleted (cascade)
SELECT * FROM menu_item WHERE restaurant_id = <restaurant_id>;
-- Should return 0 rows
```

---

### ✅ Test 2: Delete Menu Item (Manage Restaurant)

**Steps:**
1. Login as OWNER
2. Navigate to Owner Dashboard
3. Click "⚙️ Manage" on any restaurant
4. Locate a menu item in the list
5. Find the "Delete" button (outlined red, on the right side of each item)
6. Click "Delete"
7. **Expected**: UI changes to show:
   - "Sure?" text
   - "Yes" button (red filled)
   - "No" button (gray outlined)

**Test Case A - No:**
8. Click "No"
9. **Expected**: Buttons revert to single "Delete" button
10. Menu item remains in the list

**Test Case B - Yes:**
8. Click "Yes"
9. **Expected**:
   - Loading state: "..." on button
   - Success toast: "Item deleted."
   - Menu item disappears from list
10. Refresh page
11. **Expected**: Item still not visible

**Database Verification:**
```sql
-- Check menu item is deleted
SELECT * FROM menu_item WHERE id = <item_id>;
-- Should return 0 rows
```

---

### ✅ Test 3: Logout Confirmation Modal

**Steps:**
1. Login as any user (OWNER or CUSTOMER)
2. Look for profile icon in top-right corner (circular with initials)
3. Click profile icon
4. **Expected**: Dropdown menu appears with:
   - User name and email
   - "👤 My Profile" option
   - "🚪 Logout" option (red text)
5. Click "🚪 Logout"
6. **Expected**: Modal appears with:
   - Title: "Confirm Logout"
   - Message: "Are you sure you want to logout?"
   - Two buttons: "Cancel" and "Yes, Logout" (red)
   - Dark overlay behind modal

**Test Case A - Cancel:**
7. Click "Cancel"
8. **Expected**: Modal closes, user remains logged in

**Test Case B - Click Outside:**
7. Click on the dark overlay (outside the modal)
8. **Expected**: Modal closes, user remains logged in

**Test Case C - Confirm Logout:**
7. Click "Yes, Logout" (red button)
8. **Expected**:
   - Modal closes
   - User is logged out
   - Redirected to `/login` page
   - JWT token removed from localStorage
9. Try to access protected route (e.g., `/owner-dashboard`)
10. **Expected**: Redirected to login page

---

## 🔍 Visual Verification

### Delete Restaurant Button:
```
┌─────────────────────────────┐
│  [View]    [Manage]         │  ← Before clicking delete
│  [🗑️ Delete Restaurant]     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  [View]    [Manage]         │  ← After clicking delete
│  [✓ Confirm]    [Cancel]    │
└─────────────────────────────┘
```

### Delete Menu Item:
```
[Available] [Special] [Deal] [Edit] [Delete]  ← Before

[Available] [Special] [Deal] [Edit] Sure? [Yes] [No]  ← After
```

### Logout Modal:
```
┌──────────────────────────────────┐
│                                  │
│    Confirm Logout                │
│                                  │
│    Are you sure you want to      │
│    logout?                       │
│                                  │
│              [Cancel] [Yes, Logout] │
│                                  │
└──────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: Delete button not visible
**Check:**
- User logged in as OWNER
- Restaurant belongs to logged-in owner
- Page fully loaded

### Issue: Delete not working (500 error)
**Check:**
- Backend logs for detailed error
- Database connection
- Restaurant ownership validation
- Run: `Get-Process -Name "java"` to check if backend is running

### Issue: Logout modal not appearing
**Check:**
- Browser console for errors
- React DevTools for state changes
- `showLogoutConfirm` state should be `true`

### Issue: Restaurant not deleted from database
**Check:**
- Backend logs: Should show "Restaurant {id} deleted successfully"
- Check for foreign key constraints
- Verify cascade settings on relationships

---

## 📊 Expected Backend Logs

### Successful Delete Restaurant:
```
INFO - Deleting restaurant {uuid} for owner {ownerUuid}
INFO - Restaurant {uuid} deleted successfully
```

### Successful Delete Menu Item:
```
INFO - Deleting menu item {id} from restaurant {uuid}
INFO - Menu item deleted successfully
```

### Failed Delete (Not Owner):
```
WARN - User {uuid} attempted to delete restaurant {uuid} they don't own
ERROR - ForbiddenException: Not authorized to delete this restaurant
```

---

## ✅ Success Checklist

After testing, verify:

**Delete Restaurant:**
- [ ] Button visible on restaurant cards
- [ ] Confirmation step works
- [ ] Cancel works correctly
- [ ] Confirm deletes restaurant
- [ ] Success toast appears
- [ ] Database record removed
- [ ] Menu items also deleted (cascade)

**Delete Menu Item:**
- [ ] Button visible for each item
- [ ] Confirmation works
- [ ] Cancel works
- [ ] Confirm deletes item
- [ ] Success toast appears
- [ ] Database record removed

**Logout Confirmation:**
- [ ] Modal appears on logout click
- [ ] Modal has proper styling
- [ ] Cancel closes modal
- [ ] Click outside closes modal
- [ ] Confirm logs out user
- [ ] Redirects to login page
- [ ] Token removed from localStorage

---

## 🎯 Edge Cases to Test

### Delete Restaurant:
1. Delete restaurant with many menu items → All items should be deleted
2. Delete restaurant with active orders → Should handle gracefully
3. Try deleting another owner's restaurant → Should get 403 Forbidden
4. Delete while another tab has the same restaurant → Second tab should show error on next action

### Delete Menu Item:
1. Delete item from long menu (scroll) → Scroll position maintained
2. Delete last item in menu → Empty state should show
3. Delete item that's in someone's cart → Should handle gracefully

### Logout:
1. Logout while network request in progress → Should complete or cancel gracefully
2. Multiple logout clicks → Should only process once
3. Logout on different pages → Should work from anywhere

---

## 📸 Screenshots to Verify

1. **Owner Dashboard** - Show delete button on restaurant card
2. **Delete Confirmation** - Show "Confirm Delete" and "Cancel" buttons
3. **Manage Restaurant** - Show delete confirmation for menu item
4. **Logout Modal** - Show centered modal with overlay
5. **Success Toast** - Show deletion success message

---

## 🚨 Common Errors & Fixes

### Error: "Request method 'DELETE' not supported"
**Fix:** Restart backend, endpoint might not be registered

### Error: "403 Forbidden"
**Fix:** User doesn't own the restaurant, check JWT token and user ID

### Error: "Cannot read properties of undefined"
**Fix:** State not initialized, check React component mounting

### Error: Modal doesn't close
**Fix:** Check click handler on overlay div, ensure `stopPropagation` on modal content

---

## 📞 Need Help?

If issues persist:
1. Check browser console for frontend errors
2. Check backend logs for detailed error messages
3. Verify database constraints and foreign keys
4. Test API endpoints directly with Postman
5. Clear browser cache and localStorage
6. Restart both backend and frontend

---

**Ready to Test!** 🎉

Start with Test 1 (Delete Restaurant) and work through each scenario systematically.

