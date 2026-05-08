import api from "./axiosConfig";

// Restaurant-related API wrappers
// These are thin helpers that call the backend endpoints using the
// shared `api` axios instance (which handles auth headers).

// Customer Restaurant APIs
export const getRestaurants = (location) =>
  api.get("/customer/restaurants", { params: location ? { location } : {} });

export const getRestaurant = (publicId) =>
  api.get(`/customer/restaurants/${publicId}`);

export const searchRestaurants = (keyword) =>
  api.get("/customer/restaurants/search", { params: { keyword } });

// Owner Restaurant APIs
export const createRestaurant = (formData) =>
  api.post("/owner/restaurants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getMyRestaurants = () => api.get("/owner/restaurants");

export const getOwnerRestaurant = (publicId) =>
  api.get(`/owner/restaurants/${publicId}`);

export const searchOwnerRestaurants = (keyword) =>
  api.get("/owner/restaurants/search", { params: { keyword } });

export const updateRestaurantStatus = (publicId, status) =>
  api.put(`/owner/restaurants/${publicId}/status`, { status });

export const deleteRestaurant = (publicId) =>
  api.delete(`/owner/restaurants/${publicId}`);

// Ratings, recommendations, specials etc. — simple wrappers below
export const submitRating = (restaurantId, rating) =>
  api.post("/customer/ratings", { restaurantId, rating });

export const getMostOrdered = () => api.get("/customer/most-ordered");

export const savePreferences = (data) =>
  api.post("/customer/preferences", data);
export const getPreferences = () => api.get("/customer/preferences");

export const getRecommendations = (userId) =>
  api.get(`/customer/recommendations/${userId}`);

export const getSpecials = () => api.get("/customer/specials");

export const markAsSpecial = (foodId, isSpecial) =>
  api.put(`/owner/foods/${foodId}/special`, { isSpecial });
export const markAsDeal = (foodId, isDealOfDay) =>
  api.put(`/owner/foods/${foodId}/deal`, { isDealOfDay });
