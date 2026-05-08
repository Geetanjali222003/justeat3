import api from "./axiosConfig";

// Cart API wrappers — use the shared axios instance which already
// attaches auth headers. These helpers keep API calls consistent
// across components.
export const addToCart = (menuItemId, quantity) =>
  api.post("/cart/add", { menuItemId, quantity });

export const getCart = () => api.get("/cart");

export const getCartByUserId = (userId) => api.get(`/cart/${userId}`);

export const removeCartItem = (cartItemId) =>
  api.delete(`/cart/item/${cartItemId}`);

export const clearCart = () => api.delete("/cart/clear");

export const updateCartItemQuantity = (cartItemId, quantity) =>
  api.put(`/cart/item/${cartItemId}`, { quantity });
