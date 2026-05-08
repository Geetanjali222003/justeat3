import api from "./axiosConfig";

/*
  profileApi.js
  - Helpers for retrieving and updating the currently authenticated user's
    profile and profile image.
*/

/**
 * Get current user's profile data.
 * @returns {Promise}
 */
export const getProfile = () => api.get("/profile");

/**
 * Update current user's profile information.
 * @param {Object} data - profile fields to update
 * @returns {Promise}
 */
export const updateProfile = (data) => api.put("/profile", data);

/**
 * Upload or update the user's profile image.
 * Expects a File object and sends as FormData.
 * @param {File} imageFile
 * @returns {Promise}
 */
export const updateProfileImage = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return api.post("/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
