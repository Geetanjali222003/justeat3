import { createContext, useContext, useState } from "react";
import {
  login as loginService,
  logout as logoutService,
} from "../auth/authService";

/*
  AuthContext.jsx
  - Provides authentication state and helpers to the app via React Context.
  - Stored state mirrors values persisted in `localStorage` so auth survives
    page reloads (token, role, userId, userLocation).
  - Exposes `login` and `logout` functions that wrap the backend auth
    service and update both localStorage and React state.
*/

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage so the app remains logged in after
  // a page refresh if valid auth values are present.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [userLocation, setUserLocation] = useState(() =>
    localStorage.getItem("userLocation"),
  );

  /**
   * Log in by calling the auth service, persist returned values, and update
   * context state so consuming components re-render with the new auth state.
   * Returns the raw response so callers can inspect status/data.
   */
  const login = async (credentials) => {
    const res = await loginService(credentials);
    const { token: jwt, role: userRole, userId: uid, location } = res.data;
    // Persist important auth data for subsequent page loads
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userId", uid);
    if (location) localStorage.setItem("userLocation", location);

    // Update React state so consumers receive the new auth values
    setToken(jwt);
    setRole(userRole);
    setUserId(uid);
    setUserLocation(location || null);
    return res;
  };

  /**
   * Logout: clear local auth state and call `logoutService` which may perform
   * additional server-side session cleanup if implemented.
   * Note: we remove `userLocation` from storage here; token/role/userId are
   * expected to be cleared by `logoutService` (or you can remove them here
   * as well if you prefer explicitness).
   */
  const logout = () => {
    logoutService();
    setToken(null);
    setRole(null);
    setUserId(null);
    setUserLocation(null);
    localStorage.removeItem("userLocation");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userId,
        userLocation,
        login,
        logout,
        // Consumer convenience boolean for quick auth checks
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Simple hook for components to access auth context values
export const useAuth = () => useContext(AuthContext);
