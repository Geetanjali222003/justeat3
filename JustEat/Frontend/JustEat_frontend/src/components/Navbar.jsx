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

// Top navigation bar component
// Shows logo, navigation links and user profile dropdown
// - Uses `useAuth` to determine role and conditionally render links
// - Fetches current user's profile for the avatar / initials
const Navbar = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
        {/* Brand logo (linked to home) - uses Bootstrap utilities for spacing */}
        <Link to="/" className="text-decoration-none">
          <div className="d-flex align-items-center gap-2">
            <span
              className="fs-3 fw-bold"
              style={{ color: "var(--primary-orange)" }}
            >
              🍕 JustEat
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {/* Render owner- or customer-specific links based on `role` */}
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
          {/* Button shows profile image or initials; dropdown contains profile actions */}
          <div
            ref={dropdownRef}
            style={{ position: "relative", marginLeft: "12px" }}
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid var(--primary-orange)",
                backgroundColor: profile?.profileImageUrl
                  ? "transparent"
                  : "var(--primary-orange)",
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
                {/* Navigate to profile or trigger logout confirmation */}
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
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    👤 My Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutConfirm(true);
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
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden fallback logout button (not used when dropdown is present) */}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ marginBottom: "16px", fontWeight: "600" }}>
              Confirm Logout
            </h5>
            <p style={{ color: "var(--text-gray)", marginBottom: "24px" }}>
              Are you sure you want to logout?
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
