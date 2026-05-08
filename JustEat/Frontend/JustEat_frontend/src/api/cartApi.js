import api from "./axiosConfig";

/*
  cartApi.js
  - Thin wrappers around cart-related backend endpoints.
  - Each exported function returns the `axios` promise so callers can
    `await` or chain `.then()`/.catch().
*/

/**
 * Add an item to the current user's cart.
 * @param {string} menuItemId - ID of the menu item to add
 * @param {number} quantity - quantity to add
 * @returns {Promise} axios response promise
 */
export const addToCart = (menuItemId, quantity) =>
  api.post("/cart/add", { menuItemId, quantity });

/**
 * Retrieve the current user's cart.
 * @returns {Promise}
 */
export const getCart = () => api.get("/cart");

/**
 * Retrieve a cart by a specific user id (admin/testing/owner flows).
 * @param {string} userId
 * @returns {Promise}
 */
export const getCartByUserId = (userId) => api.get(`/cart/${userId}`);

/**
 * Remove a single cart item by its id.
 * @param {string} cartItemId
 * @returns {Promise}
 */
export const removeCartItem = (cartItemId) =>
  api.delete(`/cart/item/${cartItemId}`);

/**
 * Clear the entire cart for the current user.
 * @returns {Promise}
 */
export const clearCart = () => api.delete("/cart/clear");

/**
 * Update the quantity for a cart item.
 * @param {string} cartItemId
 * @param {number} quantity
 * @returns {Promise}
 */
export const updateCartItemQuantity = (cartItemId, quantity) =>
  api.put(`/cart/item/${cartItemId}`, { quantity });
