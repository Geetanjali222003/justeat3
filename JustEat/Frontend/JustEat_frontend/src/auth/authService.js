import api from "../api/axiosConfig";

/*
  authService.js
  - Thin wrappers around authentication-related backend endpoints.
  - Each function returns the axios promise for the caller to handle.
  - The `logout` function additionally clears local auth state from localStorage.
*/

/**
 * Authenticate a user with email and password.
 * @param {Object} credentials - { email, password }
 * @returns {Promise} axios response with { token, role, userId, location }
 */
export const login = (credentials) => api.post("/auth/login", credentials);

/**
 * Register a new user account with OTP verification.
 * @param {Object} userData - includes firstName, lastName, email, password, otp, role, etc.
 * @returns {Promise} axios response
 */
export const register = (userData) => api.post("/auth/register", userData);

/**
 * Send OTP to email for registration verification.
 * @param {string} email
 * @returns {Promise}
 */
export const sendOtp = (email) => api.post("/auth/send-otp", { email });

/**
 * Send OTP to email for password reset flow.
 * @param {string} email
 * @returns {Promise}
 */
export const sendResetOtp = (email) =>
  api.post("/auth/send-reset-otp", { email });

/**
 * Reset password using OTP verification.
 * @param {Object} data - { email, otp, newPassword }
 * @returns {Promise}
 */
export const resetPassword = (data) => api.post("/auth/reset-password", data);

/**
 * Clear local authentication state (token, role, userId) from localStorage.
 * This does not make a server call; just cleans up client-side storage.
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};
