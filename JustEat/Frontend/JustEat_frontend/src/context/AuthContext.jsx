import { createContext, useContext, useState } from "react";
import {
  login as loginService,
  logout as logoutService,
} from "../auth/authService";

// AuthContext provides authentication state (token, role, userId, location)
// and helper methods (`login`, `logout`) to the rest of the app via context.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [userLocation, setUserLocation] = useState(() =>
    localStorage.getItem("userLocation"),
  );

  const login = async (credentials) => {
    // Call auth service and persist result into localStorage + state
    const res = await loginService(credentials);
    const { token: jwt, role: userRole, userId: uid, location } = res.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userId", uid);
    if (location) localStorage.setItem("userLocation", location);
    setToken(jwt);
    setRole(userRole);
    setUserId(uid);
    setUserLocation(location || null);
    return res;
  };

  const logout = () => {
    // Clear auth state and notify auth service (if any)
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
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
