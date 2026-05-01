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
