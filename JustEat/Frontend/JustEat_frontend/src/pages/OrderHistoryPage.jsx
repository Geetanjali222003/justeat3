import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getOrderHistory, reorder } from "../api/orderApi";

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getOrderHistory();
      setOrders(res.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else if (showLoading) {
        setError("Failed to load order history.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial fetch + polling every 5 seconds for live status
  useEffect(() => {
    fetchOrders(true);

    intervalRef.current = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleReorder = async (e, publicId) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setReorderingId(publicId);
    setError("");
    try {
      await reorder(publicId);
      toast.success("Items added to cart!");
      setTimeout(() => navigate("/cart"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reorder";
      setError(msg);
      toast.error(msg);
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: "bg-warning",
      CONFIRMED: "bg-info",
      PREPARING: "bg-warning",
      READY: "bg-primary",
      COMPLETED: "bg-success",
      OUT_FOR_DELIVERY: "bg-info",
      DELIVERED: "bg-success",
      CANCELLED: "bg-danger",
    };
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
