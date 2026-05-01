import api from "./axiosConfig";

export const getRestaurants = (location) =>
  api.get("/restaurants", { params: location ? { location } : {} });

export const getRestaurant = (publicId) => api.get(`/restaurants/${publicId}`);

export const createRestaurant = (formData) =>
  api.post("/restaurants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getMyRestaurants = () => api.get("/restaurants/my");

// Rating API
export const submitRating = (restaurantId, rating) =>
  api.post("/customer/ratings", { restaurantId, rating });

// Most Ordered API
export const getMostOrdered = () => api.get("/customer/most-ordered");
