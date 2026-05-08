import api from "./axiosConfig";

/*
  restaurantApi.js
  - Collection of restaurant-related API helpers for both customer and
    owner flows: searching, retrieving details, creating/updating restaurants,
    and simple utility endpoints (ratings, recommendations, specials).
*/

// ---------------- Customer Restaurant APIs ----------------
/**
 * Get a list of restaurants. Optionally filter by `location`.
 * @param {string} [location]
 * @returns {Promise}
 */
export const getRestaurants = (location) =>
  api.get("/customer/restaurants", { params: location ? { location } : {} });

/**
 * Get a single restaurant's public details.
 * @param {string} publicId
 * @returns {Promise}
 */
export const getRestaurant = (publicId) =>
  api.get(`/customer/restaurants/${publicId}`);

/**
 * Search restaurants by a keyword (customer view).
 * @param {string} keyword
 * @returns {Promise}
 */
export const searchRestaurants = (keyword) =>
  api.get("/customer/restaurants/search", { params: { keyword } });

// ---------------- Owner Restaurant APIs ----------------
/**
 * Create a new restaurant (owner). Expects FormData for images.
 * @param {FormData} formData
 * @returns {Promise}
 */
export const createRestaurant = (formData) =>
  api.post("/owner/restaurants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/**
 * Get restaurants owned by the current owner.
 * @returns {Promise}
 */
export const getMyRestaurants = () => api.get("/owner/restaurants");

/**
 * Get owner view of a specific restaurant.
 * @param {string} publicId
 * @returns {Promise}
 */
export const getOwnerRestaurant = (publicId) =>
  api.get(`/owner/restaurants/${publicId}`);

/**
 * Search restaurants owned by the current owner.
 * @param {string} keyword
 * @returns {Promise}
 */
export const searchOwnerRestaurants = (keyword) =>
  api.get("/owner/restaurants/search", { params: { keyword } });

/**
 * Update a restaurant's active/open status.
 * @param {string} publicId
 * @param {string|boolean} status
 * @returns {Promise}
 */
export const updateRestaurantStatus = (publicId, status) =>
  api.put(`/owner/restaurants/${publicId}/status`, { status });

/**
 * Delete a restaurant (owner action).
 * @param {string} publicId
 * @returns {Promise}
 */
export const deleteRestaurant = (publicId) =>
  api.delete(`/owner/restaurants/${publicId}`);

// ---------------- Ratings, Recommendations, Specials ----------------
/**
 * Submit a rating for a restaurant (customer).
 * @param {string} restaurantId
 * @param {number} rating
 * @returns {Promise}
 */
export const submitRating = (restaurantId, rating) =>
  api.post("/customer/ratings", { restaurantId, rating });

/**
 * Get most-ordered items for recommendation widgets.
 * @returns {Promise}
 */
export const getMostOrdered = () => api.get("/customer/most-ordered");

/**
 * Save customer food preferences.
 * @param {Object} data
 * @returns {Promise}
 */
export const savePreferences = (data) =>
  api.post("/customer/preferences", data);
export const getPreferences = () => api.get("/customer/preferences");

/**
 * Get personalized recommendations for a user.
 * @param {string} userId
 * @returns {Promise}
 */
export const getRecommendations = (userId) =>
  api.get(`/customer/recommendations/${userId}`);

/**
 * Retrieve current specials for customers.
 * @returns {Promise}
 */
export const getSpecials = () => api.get("/customer/specials");

/**
 * Mark or unmark a food as special (owner).
 * @param {string} foodId
 * @param {boolean} isSpecial
 * @returns {Promise}
 */
export const markAsSpecial = (foodId, isSpecial) =>
  api.put(`/owner/foods/${foodId}/special`, { isSpecial });
/**
 * Mark or unmark a food as deal of the day (owner).
 * @param {string} foodId
 * @param {boolean} isDealOfDay
 * @returns {Promise}
 */
export const markAsDeal = (foodId, isDealOfDay) =>
  api.put(`/owner/foods/${foodId}/deal`, { isDealOfDay });
