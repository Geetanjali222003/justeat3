import { createContext, useContext, useEffect, useState } from "react";

/*
  ThemeContext.jsx
  - Provides theme state (dark/light mode) to the application via React Context.
  - Persists theme preference in localStorage so user's choice survives page reloads.
  - Applies/removes 'dark' class on document root for CSS-based theme switching.
  - Exposes `toggle` function to switch between dark and light themes.
*/

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme state from localStorage; defaults to light mode if not set
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  // Apply theme changes to DOM and persist preference whenever theme toggles
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context values.
 * @returns {Object} { dark: boolean, toggle: function }
 */
export const useTheme = () => useContext(ThemeContext);
