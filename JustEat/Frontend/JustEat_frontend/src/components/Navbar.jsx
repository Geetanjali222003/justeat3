import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { logout, role } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm h-16 flex items-center justify-between px-8">
      <Link
        to="/"
        className="text-2xl font-extrabold text-orange-500 tracking-tight no-underline"
      >
        Just<span className="text-gray-900 dark:text-white">Eat</span>
      </Link>
      <div className="flex items-center gap-4">
        {role === "OWNER" && (
          <>
            <Link
              to="/owner/orders"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-semibold text-sm transition-colors no-underline"
            >
              📋 Orders
            </Link>
            <Link to="/create-restaurant">
              <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer bg-transparent">
                + Add Restaurant
              </button>
            </Link>
          </>
        )}
        {role === "CUSTOMER" && (
          <>
            <Link
              to="/cart"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-semibold text-sm transition-colors no-underline"
            >
              🛒 Cart
            </Link>
            <Link
              to="/orders"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-semibold text-sm transition-colors no-underline"
            >
              📦 Orders
            </Link>
          </>
        )}
        <button
          onClick={toggle}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 w-9 h-9 rounded-lg transition-all flex items-center justify-center cursor-pointer border-none text-base"
        >
          {dark ? "☀️" : "🌙"}
        </button>
        <button
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer border-none"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
