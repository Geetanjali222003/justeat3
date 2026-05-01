import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOwnerOrders, updateOrderStatus } from "../api/orderApi";

const STATUS_OPTIONS = ["PENDING", "PREPARING", "READY", "COMPLETED"];

const statusCls = (status) => {
  const base = "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  const map = {
    PENDING: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400`,
    PREPARING: `${base} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400`,
    READY: `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`,
    COMPLETED: `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`,
  };
  return map[status] || base;
};

const OwnerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
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

  // Initial fetch + polling every 5 seconds
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
      setSuccessMsg("Status updated!");
      setTimeout(() => setSuccessMsg(""), 2000);
      // Refresh orders
      await fetchOrders(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/owner-dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📋 Customer Orders
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live updates
          </div>
        </div>

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm mb-4">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No orders yet
            </h3>
            <p className="mt-2">Orders from customers will appear here.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.publicId}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-l-4 border-orange-500"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {order.restaurantName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Order ID: {order.publicId?.substring(0, 8)}...
                    </div>
                  </div>
                  <span className={statusCls(order.status)}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    👤 {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    📧 {order.customerEmail}
                  </div>
                  {order.createdAt && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      🕒 {new Date(order.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Items:
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer - Total & Status Update */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xl font-extrabold text-orange-500">
                    ₹{order.totalAmount?.toFixed(2)}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      Update:
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.publicId, e.target.value)}
                      disabled={updatingId === order.publicId}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {updatingId === order.publicId && (
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                    )}
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

