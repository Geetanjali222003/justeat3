import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getOwnerOrders, updateOrderStatus } from "../api/orderApi";

/*
  OwnerOrdersPage.jsx
  - Displays all orders for restaurants owned by the current owner.
  - Features:
    * Real-time order list with auto-refresh every 5 seconds
    * Shows customer info (name, email), order items, and total amount
    * Dropdown to update order status (PENDING, PREPARING, READY, COMPLETED)
    * Live indicator badge to show data is being refreshed
  - Uses polling mechanism (setInterval) to keep order data current.
*/

// Available status options for order progression
const STATUS_OPTIONS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

/**
 * OwnerOrdersPage Component
 * Lists and manages orders for owner's restaurants with real-time updates.
 */
const OwnerOrdersPage = () => {
  // Hook for programmatic navigation between pages
  const navigate = useNavigate();

  // State: Array of order objects fetched from API
  const [orders, setOrders] = useState([]);

  // State: Loading indicator for initial page load
  const [loading, setLoading] = useState(true);

  // State: Error message to display if API fails
  const [error, setError] = useState("");

  // State: Tracks which order is currently being updated (for disabling dropdown)
  const [updatingId, setUpdatingId] = useState(null);

  // Ref: Stores interval ID for polling cleanup on unmount
  const intervalRef = useRef(null);

  /**
   * Fetch orders from API with optional loading indicator
   * @param {boolean} showLoading - If true, displays loading spinner
   */
  const fetchOrders = async (showLoading = false) => {
    // Only show loading spinner on initial load, not during polling refreshes
    if (showLoading) setLoading(true);

    try {
      // Call API to get all orders for this owner's restaurants
      const res = await getOwnerOrders();

      // Update state with fetched orders (empty array if no data)
      setOrders(res.data || []);

      // Clear any previous error messages on success
      setError("");
    } catch (err) {
      // Handle 404 as empty state (no orders yet), not an error
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        // For other errors, set error message for UI display
        setError("Failed to load orders.");
      }
    } finally {
      // Hide loading spinner only if we showed it for this request
      if (showLoading) setLoading(false);
    }
  };

  /**
   * Setup polling on component mount, cleanup on unmount
   * Effect runs once due to empty dependency array
   */
  useEffect(() => {
    // Initial fetch with loading spinner
    fetchOrders(true);

    // Set up interval to refresh orders every 5 seconds (silent refresh)
    intervalRef.current = setInterval(() => {
      fetchOrders(false); // No loading spinner for polling updates
    }, 5000);

    // Cleanup function: clear interval when component unmounts
    // Prevents memory leaks and unnecessary API calls
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty array = run once on mount

  /**
   * Handle order status update from dropdown selection
   * @param {string} publicId - Unique order identifier
   * @param {string} newStatus - New status selected from dropdown
   */
  const handleStatusChange = async (publicId, newStatus) => {
    // Set this order as updating (disables its dropdown)
    setUpdatingId(publicId);

    // Clear previous errors
    setError("");

    try {
      // Call API to update order status
      await updateOrderStatus(publicId, newStatus);

      // Show success notification
      toast.success("Status updated!");

      // Refresh orders list to show updated status (silent refresh)
      await fetchOrders(false);
    } catch (err) {
      // Extract error message from API response or use fallback
      const msg = err.response?.data?.message || "Failed to update status";

      // Display error in both UI and toast notification
      setError(msg);
      toast.error(msg);
    } finally {
      // Clear updating state (re-enables dropdown)
      setUpdatingId(null);
    }
  };

  /**
   * Map order status to Bootstrap badge color class
   * @param {string} status - Order status (PENDING, PREPARING, etc.)
   * @returns {string} Bootstrap class name for badge styling
   */
  const getStatusBadge = (status) => {
    // Define color mapping for each status
    const map = {
      PENDING: "bg-warning", // Yellow for pending orders
      PREPARING: "bg-info", // Blue for orders being prepared
      READY: "bg-primary", // Primary blue for ready orders
      COMPLETED: "bg-success", // Green for completed orders
    };
    // Return mapped color or gray for unknown statuses
    return map[status] || "bg-secondary";
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Back Button */}
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/owner-dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h4 fw-bold mb-0">📋 Customer Orders</h1>
          <span className="badge bg-success d-flex align-items-center gap-1">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            ></span>
            Live
          </span>
        </div>

        {/* Error Alert */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>📭</div>
            <h5 className="mt-3">No orders yet</h5>
            <p className="text-muted">Orders from customers will appear here</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order.publicId} className="col-12 col-lg-6">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderLeft: "4px solid var(--primary-orange)" }}
                >
                  <div className="card-body">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">{order.restaurantName}</h6>
                        <small className="text-muted">
                          ID: {order.publicId?.substring(0, 8)}...
                        </small>
                      </div>
                      <span
                        className={`badge ${getStatusBadge(order.status)}`}
                        style={{ fontSize: "10px" }}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-light rounded p-2 mb-3 small">
                      <div className="fw-semibold">👤 {order.customerName}</div>
                      <div className="text-muted">📧 {order.customerEmail}</div>
                      {order.createdAt && (
                        <div
                          className="text-muted"
                          style={{ fontSize: "11px" }}
                        >
                          🕒 {new Date(order.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <ul className="list-group list-group-flush mb-3">
                        {order.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="list-group-item d-flex justify-content-between px-0 py-1 border-0 small"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span className="text-muted">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Footer */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <span
                        className="h5 fw-bold mb-0"
                        style={{ color: "var(--primary-orange)" }}
                      >
                        ₹{order.totalAmount?.toFixed(2)}
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.publicId, e.target.value)
                          }
                          disabled={updatingId === order.publicId}
                          className="form-select form-select-sm"
                          style={{ width: "auto" }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {updatingId === order.publicId && (
                          <div
                            className="spinner-border spinner-border-sm text-warning"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        )}
                      </div>
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

export default OwnerOrdersPage;
