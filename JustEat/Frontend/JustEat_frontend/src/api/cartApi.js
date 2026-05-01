import api from "./axiosConfig";

// Cart APIs
export const addToCart = (menuItemId, quantity) =>
  api.post("/cart/add", { menuItemId, quantity });

export const getCart = () => api.get("/cart");

export const removeCartItem = (cartItemId) =>
  api.delete(`/cart/item/${cartItemId}`);

export const clearCart = () => api.delete("/cart/clear");

