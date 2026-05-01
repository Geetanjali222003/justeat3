import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../api/orderApi";

const getStatusBadge = (status) => {
  const map = {
    PENDING: "bg-warning text-dark",
    CONFIRMED: "bg-info text-white",
    PREPARING: "bg-warning text-dark",
    OUT_FOR_DELIVERY: "bg-primary",
    DELIVERED: "bg-success",
    CANCELLED: "bg-danger",
  };
  return map[status] || "bg-secondary";
};

const OrderDetailsPage = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await getOrderById(publicId);
        setOrder(res.data);
      } catch {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [publicId]);

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: "700px" }}>
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && order && (
          <>
            {/* Header */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <div>
                    <h4 className="fw-bold mb-1">
                      {order.restaurant?.name || "Restaurant"}
                    </h4>
                    <small className="text-muted">
                      Order #{order.publicId?.slice(0, 8).toUpperCase()}
                    </small>
                  </div>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status?.replace("_", " ")}
                  </span>
                </div>
                <small className="text-muted">
                  Placed on:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </small>
              </div>
            </div>

            {/* Items */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Order Items</h5>
                <ul className="list-group list-group-flush">
                  {order.items?.map((item, idx) => (
                    <li
                      key={item.id || idx}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <div className="fw-semibold">
                          {item.menuItem?.name || "Item"}
                        </div>
                        <small className="text-muted">
                          ₹{item.price?.toFixed(2)} × {item.quantity}
                        </small>
                      </div>
                      <span className="fw-bold" style={{ color: "#fc8019" }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Total */}
            <div
              className="card border-0 shadow-sm"
              style={{ background: "#f8f9fa" }}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <span className="fw-semibold text-muted">Total Amount</span>
                <span className="h4 fw-bold mb-0" style={{ color: "#fc8019" }}>
                  ₹{order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrderDetailsPage;
