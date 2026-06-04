import axios from "axios";

/*
  axiosConfig.js
  - Creates and exports a centralized `axios` instance used throughout the
    frontend for server communication.
  - Responsibilities:
    * configure `baseURL` for the backend API
    * set sensible defaults (JSON content-type, include credentials)
    * attach JWT `Authorization` header when present in localStorage
    * surface common response handling (e.g. 401 -> redirect to login)
*/
const api = axios.create({
  baseURL: "http://98.92.13.239:8090",
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
    // If the server returns 401 and we don't have a token saved,
    // send the user to the login page.
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
