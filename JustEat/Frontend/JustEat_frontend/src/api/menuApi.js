import api from "./axiosConfig";

// Customer: Get menu items for a restaurant
export const getMenu = (restaurantPublicId) =>
  api.get(`/customer/restaurants/${restaurantPublicId}/menu`);

// Owner: Menu Management
export const getOwnerMenu = (restaurantPublicId) =>
  api.get(`/owner/restaurants/${restaurantPublicId}/menu`);

export const addMenuItem = (restaurantPublicId, formData) =>
  api.post(`/owner/restaurants/${restaurantPublicId}/menu`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateMenuItem = (restaurantPublicId, menuItemId, data) =>
  api.patch(
    `/owner/restaurants/${restaurantPublicId}/menu/${menuItemId}`,
    data,
  );

export const deleteMenuItem = (restaurantPublicId, menuItemId) =>
  api.delete(`/owner/restaurants/${restaurantPublicId}/menu/${menuItemId}`);
