import api from "./axiosConfig";

/*
  orderApi.js
  - Contains order-related API helpers for customers and owners.
  - All functions return the underlying axios promise; callers should
    handle success and errors as needed.
*/

// ---------------- Customer Order APIs ----------------
/**
 * Place an order for the currently authenticated user.
 * @returns {Promise}
 */
export const placeOrder = () => api.post("/order/place");

/**
 * Place an order on behalf of a specific user (admin/test flows).
 * @param {string} userId
 * @returns {Promise}
 */
export const placeOrderByUserId = (userId) =>
  api.post(`/order/place/${userId}`);

/**
 * Get order history for the current user.
 * @returns {Promise}
 */
export const getOrderHistory = () => api.get("/order/history");

/**
 * Get order history for a specific user id.
 * @param {string} userId
 * @returns {Promise}
 */
export const getOrdersByUserId = (userId) =>
  api.get(`/order/history/${userId}`);

/**
 * Retrieve a specific order by its public id.
 * @param {string} publicId
 * @returns {Promise}
 */
export const getOrderById = (publicId) => api.get(`/order/${publicId}`);

/**
 * Re-order a previous order by id.
 * @param {string} publicId
 * @returns {Promise}
 */
export const reorder = (publicId) => api.post(`/order/reorder/${publicId}`);

// ---------------- Owner Order APIs ----------------
/**
 * Get orders relevant to the owner (restaurant owner dashboard).
 * @returns {Promise}
 */
export const getOwnerOrders = () => api.get("/order/owner");

/**
 * Update an order's status (owner action).
 * @param {string} publicId
 * @param {string} status
 * @returns {Promise}
 */
export const updateOrderStatus = (publicId, status) =>
  api.put(`/order/${publicId}/status?status=${status}`);
