import axios from "axios";

// Central axios instance for API calls.
// - `baseURL` points to API server
// - Adds JSON content-type and includes credentials
// - Request interceptor attaches JWT token when available
// - Response interceptor redirects to login on 401 when token missing
const api = axios.create({
  baseURL: "https://justeat-dyfmc5h3f0gphpch.eastasia-01.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401: if token missing, redirect user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
