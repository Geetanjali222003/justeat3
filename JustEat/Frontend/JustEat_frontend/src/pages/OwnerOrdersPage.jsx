import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getOwnerOrders, updateOrderStatus } from "../api/orderApi";

const STATUS_OPTIONS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

const OwnerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getOwnerOrders();
      setOrders(res.data || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError("Failed to load orders.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

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

  const handleStatusChange = async (publicId, newStatus) => {
    setUpdatingId(publicId);
    setError("");
    try {
      await updateOrderStatus(publicId, newStatus);
      toast.success("Status updated!");
      await fetchOrders(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update status";
      setError(msg);
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: "bg-warning",
      PREPARING: "bg-info",
      READY: "bg-primary",
      COMPLETED: "bg-success",
    };
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
