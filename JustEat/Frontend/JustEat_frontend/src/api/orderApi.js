import api from "./axiosConfig";

// Order APIs - Customer
export const placeOrder = () => api.post("/order/place");

export const placeOrderByUserId = (userId) =>
  api.post(`/order/place/${userId}`);

export const getOrderHistory = () => api.get("/order/history");

export const getOrdersByUserId = (userId) =>
  api.get(`/order/history/${userId}`);

export const getOrderById = (publicId) =>
  api.get(`/order/${publicId}`);

export const reorder = (publicId) =>
  api.post(`/order/reorder/${publicId}`);

// Order APIs - Owner
export const getOwnerOrders = () => api.get("/order/owner");

export const updateOrderStatus = (publicId, status) =>
  api.put(`/order/${publicId}/status?status=${status}`);
