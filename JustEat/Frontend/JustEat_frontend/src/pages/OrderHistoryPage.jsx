import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getOrderHistory, reorder } from "../api/orderApi";

/*
  OrderHistoryPage.jsx
  - Displays customer's order history with real-time status updates.
  - Features:
    * Auto-refresh every 5 seconds to show latest order status
    * Shows order details: restaurant, items, quantities, total amount
    * Status badges with color coding (PENDING, PREPARING, READY, COMPLETED, etc.)
    * Reorder button to quickly add past order items to cart
    * Live indicator badge to show data is being refreshed
  - Uses polling (setInterval) to keep orders updated without manual refresh.
*/

/**
 * OrderHistoryPage Component
 * Lists all orders placed by the current customer with live status updates.
 */
const OrderHistoryPage = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State: Array of order objects from API
  const [orders, setOrders] = useState([]);

  // State: Loading indicator for initial page load
  const [loading, setLoading] = useState(true);

  // State: Error message to display if operations fail
  const [error, setError] = useState("");

  // State: ID of order currently being reordered (disables its reorder button)
  const [reorderingId, setReorderingId] = useState(null);

  // Ref: Stores interval ID for polling cleanup on unmount
  const intervalRef = useRef(null);

  /**
   * Fetch order history from API with optional loading indicator
   * @param {boolean} showLoading - If true, displays loading spinner
   */
  const fetchOrders = async (showLoading = false) => {
    // Only show loading spinner on initial load, not during polling
    if (showLoading) setLoading(true);

    try {
      // Call API to get customer's order history
      const res = await getOrderHistory();

      // Update state with fetched orders (empty array if no data)
      setOrders(res.data || []);
    } catch (err) {
      // Handle 404 as empty state (no orders yet), not an error
      if (err.response?.status === 404) {
        setOrders([]);
      }
      // For other errors during initial load, set error message
      else if (showLoading) {
        setError("Failed to load order history.");
      }
      // Silently fail during polling to avoid disrupting user
    } finally {
      // Hide loading spinner only if we showed it
      if (showLoading) setLoading(false);
    }
  };

  /**
   * Setup polling on mount, cleanup on unmount
   * Fetches immediately, then every 5 seconds for live status updates
   */
  useEffect(() => {
    // Initial fetch with loading spinner
    fetchOrders(true);

    // Set up interval to refresh orders every 5 seconds (silent refresh)
    intervalRef.current = setInterval(() => {
      fetchOrders(false); // No loading spinner for polling
    }, 5000);

    // Cleanup: clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty array = run once on mount

  /**
   * Reorder a previous order (adds all items to cart)
   * @param {Event} e - Click event
   * @param {string} publicId - Order's unique identifier
   */
  const handleReorder = async (e, publicId) => {
    // Prevent any default link navigation behavior
    e.preventDefault();
    e.stopPropagation();

    // Set this order as being reordered (disables its button)
    setReorderingId(publicId);

    // Clear previous errors
    setError("");

    try {
      // Call API to add all items from this order to cart
      await reorder(publicId);

      // Show success notification
      toast.success("Items added to cart!");

      // Navigate to cart page after brief delay (let user see toast)
      setTimeout(() => navigate("/cart"), 1000);
    } catch (err) {
      // Extract error message from API response or use fallback
      const msg = err.response?.data?.message || "Failed to reorder";

      // Display error in both UI and toast
      setError(msg);
      toast.error(msg);
    } finally {
      // Clear reordering state (re-enables button)
      setReorderingId(null);
    }
  };

  /**
   * Map order status to Bootstrap badge color class
   * @param {string} status - Order status
   * @returns {string} Bootstrap class name for badge styling
   */
  const getStatusBadge = (status) => {
    // Define color mapping for each possible order status
    const map = {
      PENDING: "bg-warning", // Yellow for pending
      CONFIRMED: "bg-info", // Blue for confirmed
      PREPARING: "bg-warning", // Yellow for preparing
      READY: "bg-primary", // Primary blue for ready
      COMPLETED: "bg-success", // Green for completed
      OUT_FOR_DELIVERY: "bg-info", // Blue for out for delivery
      DELIVERED: "bg-success", // Green for delivered
      CANCELLED: "bg-danger", // Red for cancelled
    };
    // Return mapped color or gray for unknown statuses
    return map[status] || "bg-secondary";
  };

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: "700px" }}>
        {/* Back Button */}
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h4 fw-bold mb-0">Order History</h1>
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
            <div style={{ fontSize: "4rem" }}>📦</div>
            <h5 className="mt-3">No orders yet</h5>
            <p className="text-muted">Start ordering delicious food!</p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-orange mt-3"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => (
              <div
                key={order.publicId || order.id}
                className="card border-0 shadow-sm"
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">
                        {order.restaurantName ||
                          order.restaurant?.name ||
                          "Restaurant"}
                      </h6>
                      <small className="text-muted">
                        {order.items?.length || 0} item(s)
                      </small>
                    </div>
                    <span
                      className={`badge ${getStatusBadge(order.status)}`}
                      style={{ fontSize: "10px" }}
                    >
                      {order.status?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Items List */}
                  {order.items && order.items.length > 0 && (
                    <ul className="list-group list-group-flush my-2">
                      {order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="list-group-item d-flex justify-content-between px-0 py-2 border-0"
                        >
                          <span>
                            {item.name || item.menuItem?.name} × {item.quantity}
                          </span>
                          <span className="text-muted">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span
                      className="h5 fw-bold mb-0"
                      style={{ color: "var(--primary-orange)" }}
                    >
                      ₹{order.totalAmount?.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => handleReorder(e, order.publicId)}
                      disabled={reorderingId === order.publicId}
                      className="btn btn-orange btn-sm"
                    >
                      {reorderingId === order.publicId
                        ? "Adding..."
                        : "🔄 Reorder"}
                    </button>
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

export default OrderHistoryPage;
