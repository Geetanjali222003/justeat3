import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  getMyRestaurants,
  searchOwnerRestaurants,
  deleteRestaurant,
} from "../api/restaurantApi";

/*
  OwnerDashboard.jsx
  - Main dashboard for restaurant owners to view and manage their restaurants.
  - Features:
    * List all restaurants owned by the current user
    * Search restaurants by keyword with debouncing
    * Quick navigation to manage each restaurant
    * Delete restaurants with confirmation modal
  - Uses restaurantApi for all data operations.
*/

/**
 * Owner Dashboard Page Component
 * Lists all restaurants owned by the authenticated owner.
 */
const OwnerDashboard = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State: Array of restaurant objects owned by this user
  const [restaurants, setRestaurants] = useState([]);

  // State: Loading indicator for initial page load
  const [loading, setLoading] = useState(true);

  // State: Error message to display if operations fail
  const [error, setError] = useState("");

  // State: Current search input value
  const [searchTerm, setSearchTerm] = useState("");

  // State: Timeout ID for debouncing search (prevents API spam)
  const [searchTimeout, setSearchTimeout] = useState(null);

  // State: ID of restaurant currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  // State: ID of restaurant awaiting delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  /**
   * Fetch restaurants with optional keyword search
   * Wrapped in useCallback to prevent unnecessary re-renders
   * @param {string} keyword - Optional search term to filter restaurants
   */
  const fetchRestaurants = useCallback(async (keyword = "") => {
    // Show loading spinner
    setLoading(true);

    // Clear previous errors
    setError("");

    try {
      let res;

      // Use search endpoint if keyword provided, otherwise get all
      if (keyword.trim()) {
        res = await searchOwnerRestaurants(keyword);
      } else {
        res = await getMyRestaurants();
      }

      // Debug log to help troubleshoot API issues
      console.log("API response:", res.data);

      // Update state with fetched restaurants
      setRestaurants(res.data || []);
    } catch (err) {
      // Debug log to see full error details
      console.log("API Error:", err.response);

      // Handle specific HTTP error codes
      if (err.response?.status === 500) {
        // 500: Server error - backend problem
        const msg = "Server error. Please try again later.";
        setError(msg);
        toast.error(msg);
      } else {
        // Other errors: Extract message from API or use fallback
        const msg =
          err.response?.data?.message || "Failed to load restaurant data";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      // Always hide loading spinner when done
      setLoading(false);
    }
  }, []); // Empty deps = function doesn't change

  // Fetch restaurants when component mounts
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]); // Re-run if fetchRestaurants changes

  /**
   * Handle search input with debouncing
   * Waits 500ms after user stops typing before searching
   * @param {string} value - Search input value
   */
  const handleSearch = (value) => {
    // Update search term immediately for UI
    setSearchTerm(value);

    // Clear any existing timeout to reset debounce timer
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout to fetch after 500ms of no typing
    const timeout = setTimeout(() => {
      fetchRestaurants(value);
    }, 500);

    // Store timeout ID for cleanup
    setSearchTimeout(timeout);
  };

  /**
   * Delete a restaurant after confirmation
   * @param {string} publicId - Restaurant's unique identifier
   * @param {string} name - Restaurant name (for success message)
   */
  const handleDelete = async (publicId, name) => {
    // Set this restaurant as being deleted (shows loading)
    setDeletingId(publicId);

    try {
      // Call API to delete restaurant
      await deleteRestaurant(publicId);

      // Remove from local state immediately (optimistic update)
      setRestaurants((prev) => prev.filter((r) => r.publicId !== publicId));

      // Show success notification with restaurant name
      toast.success(`${name} deleted successfully!`);

      // Close confirmation modal
      setConfirmDeleteId(null);
    } catch (err) {
      // Show error notification if deletion fails
      toast.error(err.response?.data?.message || "Failed to delete restaurant");
    } finally {
      // Clear deleting state
      setDeletingId(null);
    }
  };

  /**
   * Map restaurant status to Bootstrap badge color class
   * @param {string} status - Restaurant status (OPEN, CLOSED, etc.)
   * @returns {string} Bootstrap class name for badge styling
   */
  const getStatusBadge = (status) => {
    // Normalize status to uppercase, default to OPEN if not set
    const s = (status || "OPEN").toUpperCase();
    if (s === "OPEN") return "bg-success";
    if (s === "CLOSED") return "bg-danger";
    return "bg-warning";
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h4 fw-bold mb-1"
              style={{ color: "var(--text-dark)" }}
            >
              My Restaurants
            </h1>
            <p className="text-muted small mb-0">Manage your listings</p>
          </div>
          <button
            onClick={() => navigate("/create-restaurant")}
            className="btn btn-orange"
          >
            + Add Restaurant
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading restaurants...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button
              className="btn btn-link text-danger p-0 ms-2"
              onClick={() => fetchRestaurants()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>🏪</div>
            <h5 className="mt-3">
              {searchTerm ? "No restaurants found" : "No restaurants yet"}
            </h5>
            <p className="text-muted">
              {searchTerm
                ? "Try a different search term"
                : "Create your first restaurant listing"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/create-restaurant")}
                className="btn btn-orange mt-3"
              >
                + Create Restaurant
              </button>
            )}
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="row g-4">
            {restaurants.map((r) => (
              <div key={r.publicId} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm"
                  style={{ border: "none" }}
                >
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="card-img-top"
                      style={{ height: "140px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center"
                      style={{
                        height: "140px",
                        background: "#fff5eb",
                        fontSize: "2.5rem",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title fw-bold mb-0">{r.name}</h6>
                      <span
                        className={`badge ${getStatusBadge(r.restaurantStatus)}`}
                        style={{ fontSize: "10px" }}
                      >
                        {r.restaurantStatus || "OPEN"}
                      </span>
                    </div>
                    <p
                      className="card-text text-muted small mb-2"
                      style={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.description}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
                      <span>📍 {r.location}</span>
                    </div>
                    {/* Rating */}
                    <div className="d-flex align-items-center gap-1 mb-3">
                      <span style={{ color: "#ffc107", fontSize: "14px" }}>
                        ⭐
                      </span>
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "14px" }}
                      >
                        {r.rating != null ? r.rating.toFixed(1) : "0.0"} / 5
                      </span>
                      {r.ratingCount > 0 && (
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          ({r.ratingCount})
                        </span>
                      )}
                    </div>
                    {/* Cuisine Tags */}
                    {(r.cuisineTypes || []).length > 0 && (
                      <div className="d-flex gap-1 flex-wrap mb-3">
                        {(r.cuisineTypes || []).slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="badge"
                            style={{
                              backgroundColor: "#fff5eb",
                              color: "var(--primary-orange)",
                              fontSize: "10px",
                            }}
                          >
                            {c.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/restaurant/${r.publicId}`)}
                        className="btn btn-outline-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/manage-restaurant/${r.publicId}`)
                        }
                        className="btn btn-warning btn-sm"
                        style={{ flex: 1 }}
                      >
                        ⚙️ Manage
                      </button>
                    </div>
                    {/* Delete Button */}
                    <div className="mt-2">
                      {confirmDeleteId === r.publicId ? (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleDelete(r.publicId, r.name)}
                            className="btn btn-danger btn-sm flex-fill"
                            disabled={deletingId === r.publicId}
                          >
                            {deletingId === r.publicId
                              ? "Deleting..."
                              : "✓ Confirm Delete"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn btn-outline-secondary btn-sm flex-fill"
                            disabled={deletingId === r.publicId}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(r.publicId)}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          🗑️ Delete Restaurant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerDashboard;
