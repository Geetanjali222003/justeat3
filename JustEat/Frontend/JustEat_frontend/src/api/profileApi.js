import api from "./axiosConfig";

// Get user profile
export const getProfile = () => api.get("/profile");

// Update user profile
export const updateProfile = (data) => api.put("/profile", data);

// Update profile image
export const updateProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return api.post("/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

