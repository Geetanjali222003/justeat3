import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../api/profileApi";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    if (!profile) return "U";
    return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
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

          {/* Profile Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative", marginLeft: "12px" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid var(--primary-orange)",
                backgroundColor: profile?.profileImageUrl ? "transparent" : "var(--primary-orange)",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitials()
              )}
            </button>

            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "200px",
                  zIndex: 1000,
                }}
              >
                {/* Profile Info */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    {profile?.firstName} {profile?.lastName}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-gray)" }}>
                    {profile?.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: "8px 0" }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      backgroundColor: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    👤 My Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      backgroundColor: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#dc3545",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>

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
              display: "none", // Hidden, replaced by profile dropdown
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
