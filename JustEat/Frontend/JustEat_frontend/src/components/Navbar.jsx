import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkStyle = {
  color: "var(--text-dark)",
  fontWeight: "500",
  fontSize: "14px",
  textDecoration: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const Navbar = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="brand-logo" style={{ fontSize: "24px" }}>
            <span className="orange">Just</span>
            <span className="dark">Eat</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {role === "OWNER" && (
            <>
              <Link to="/owner/orders" style={navLinkStyle}>
                📋 Orders
              </Link>
              <Link to="/create-restaurant">
                <button
                  style={{
                    backgroundColor: "var(--primary-orange)",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  + Add Restaurant
                </button>
              </Link>
            </>
          )}
          {role === "CUSTOMER" && (
            <>
              <Link to="/cart" style={navLinkStyle}>
                🛒 Cart
              </Link>
              <Link to="/orders" style={navLinkStyle}>
                📦 Orders
              </Link>
              <Link to="/preferences" style={navLinkStyle}>
                ⚙️ Preferences
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "transparent",
              color: "var(--text-gray)",
              border: "1px solid var(--border-light)",
              padding: "8px 16px",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "13px",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
