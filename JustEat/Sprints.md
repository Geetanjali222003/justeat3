# 📌 JustEat Food Ordering Application — Sprint Plan

This document outlines the sprint-wise breakdown of features and progress for the JustEat Food Ordering Application.

---

# 🟢 Sprint 1 — Authentication & Restaurant Browsing

## 🎯 Objective

Enable users to authenticate and browse restaurants.

## 👤 User Capabilities

- Register / Login
- View restaurants by location
- View restaurant details

## 🔧 Backend

- JWT Authentication
- User Entity
- Restaurant Entity
- APIs:
  - GET /restaurants
  - GET /restaurants/{id}

## 🎨 Frontend

- Login/Register page
- Location selection
- Restaurant listing page
- Restaurant detail page

## 🔗 Integration

- Store JWT token after login
- Fetch restaurants using API
- Display based on selected location

## ✅ Outcome

User logs in → views restaurants → opens details

---

# 🔵 Sprint 2 — Menu & Owner Management

## 🎯 Objective

Enable menu viewing and restaurant management by owners.

## 👤 User Capabilities

- View restaurant menu

## 👨‍🍳 Owner Capabilities

- Create restaurant
- Add menu items
- Manage basic restaurant data

## 🔧 Backend

- MenuItem Entity
- APIs:
  - POST /restaurants (OWNER)
  - POST /menu-items
  - GET /restaurants/{id}/menu

## 🎨 Frontend

### User Side:

- Menu display on restaurant page

### Owner Side:

- Create restaurant form
- Add menu item form
- Basic owner dashboard

## 🔗 Integration

- Owner creates restaurant → visible in listing
- Menu items added → visible to customers

## ✅ Outcome

Owner adds menu → Customer can view menu

---

# 🟡 Sprint 3 — Cart (Core Flow)

## 🎯 Objective

Enable users to build and manage their cart.

## 👤 User Capabilities

- Add items to cart
- Update item quantity
- Remove items
- View cart

## 🔧 Backend

- Cart Entity
- CartItem Entity
- APIs:
  - Add to cart
  - Remove item
  - Update quantity
  - Get cart
  - Clear cart

## 🎨 Frontend

- Add to cart button
- Cart page
- Quantity controls (+ / -)
- Remove item option

## 🔗 Integration

- Add to cart updates backend
- Cart reflects real-time changes

## ✅ Outcome

User successfully builds and manages a cart

---

# 🔴 Sprint 4 — Order Flow

## 🎯 Objective

Enable users to place and track orders.

## 👤 User Capabilities

- Place order
- View order history

## 🔧 Backend

- Order Entity
- OrderItem Entity
- APIs:
  - Create order
  - Get user orders

## 🎨 Frontend

- Checkout page
- Order confirmation page
- Order history page

## 🔗 Integration

- Cart → Order conversion
- Cart clears after order

## ✅ Outcome

User places order and views it in history

---

# 🟣 Sprint 5 — Enhancements

## 🎯 Objective

Add advanced and optional features after core functionality.

## Features

- Ratings & Reviews ⭐
- Recommendation system
- Search & filtering
- Owner dashboard (orders view)
- Performance & UX improvements

---

# 🧠 Current Progress

- ✅ Sprint 1 — Completed (Frontend + Backend)
- ✅ Sprint 2 — Completed (Frontend + Backend)
- ⏳ Sprint 3 — Not Started
- ⏳ Sprint 4 — Not Started
- ⏳ Sprint 5 — Not Started

---

# 🚀 Next Step

👉 Begin Sprint 3 (Cart System — Core Application Flow)

---

# 📌 Tech Stack

- Frontend: React
- Backend: Spring Boot
- Database: PostgreSQL
- Auth: JWT

---

# 📎 Notes

- Role-based access implemented (Customer vs Owner)
- APIs secured with JWT
- Frontend integrated with backend for all completed features
