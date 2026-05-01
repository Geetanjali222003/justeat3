import api from "../api/axiosConfig";

export const login = (credentials) => api.post("/auth/login", credentials);

export const register = (userData) => api.post("/auth/register", userData);

export const sendOtp = (email) => api.post("/auth/send-otp", { email });

export const sendResetOtp = (email) =>
  api.post("/auth/send-reset-otp", { email });

export const resetPassword = (data) => api.post("/auth/reset-password", data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};
