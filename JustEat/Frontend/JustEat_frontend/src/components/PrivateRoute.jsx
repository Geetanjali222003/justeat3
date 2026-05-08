import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PrivateRoute: Protects routes that require authentication.
// If the user is not authenticated, redirects to /login.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
