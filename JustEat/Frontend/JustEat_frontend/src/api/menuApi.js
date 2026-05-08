import api from "./axiosConfig";

/*
  menuApi.js
  - Exposes customer- and owner-facing menu endpoints.
  - Owner endpoints often accept `multipart/form-data` for image uploads.
*/

/**
 * Get public menu for a restaurant (customer view).
 * @param {string} restaurantPublicId
 * @returns {Promise}
 */
export const getMenu = (restaurantPublicId) =>
  api.get(`/customer/restaurants/${restaurantPublicId}/menu`);

/**
 * Get menu for an owner (management view).
 * @param {string} restaurantPublicId
 * @returns {Promise}
 */
export const getOwnerMenu = (restaurantPublicId) =>
  api.get(`/owner/restaurants/${restaurantPublicId}/menu`);

/**
 * Add a new menu item (owner).
 * Expects a FormData instance (may include an image file).
 * @param {string} restaurantPublicId
 * @param {FormData} formData
 * @returns {Promise}
 */
export const addMenuItem = (restaurantPublicId, formData) =>
  api.post(`/owner/restaurants/${restaurantPublicId}/menu`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/**
 * Update a specific menu item (owner management).
 * @param {string} restaurantPublicId
 * @param {string} menuItemId
 * @param {Object|FormData} data
 * @returns {Promise}
 */
export const updateMenuItem = (restaurantPublicId, menuItemId, data) =>
  api.patch(
    `/owner/restaurants/${restaurantPublicId}/menu/${menuItemId}`,
    data,
  );

/**
 * Delete a menu item (owner).
 * @param {string} restaurantPublicId
 * @param {string} menuItemId
 * @returns {Promise}
 */
export const deleteMenuItem = (restaurantPublicId, menuItemId) =>
  api.delete(`/owner/restaurants/${restaurantPublicId}/menu/${menuItemId}`);
