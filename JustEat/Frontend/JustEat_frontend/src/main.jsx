import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Entry point: mount React app into #root
// Wrap App with `AuthProvider` so auth state is available throughout
// `StrictMode` is enabled for development checks
// (No runtime logic changed — comments only)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
