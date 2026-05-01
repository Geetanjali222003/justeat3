import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderHistory, reorder } from "../api/orderApi";

const statusCls = (status) => {
  const base = "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  const map = {
    PENDING: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400`,
    CONFIRMED: `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`,
    PREPARING: `${base} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400`,
    READY: `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`,
    COMPLETED: `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`,
    OUT_FOR_DELIVERY: `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400`,
    DELIVERED: `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`,
    CANCELLED: `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`,
  };
  return map[status] || base;
};

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
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
      setSuccessMsg("Items added to cart!");
      setTimeout(() => navigate("/cart"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reorder");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order History
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live status
          </div>
        </div>

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm mb-4">
            {successMsg}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No orders yet
            </h3>
            <p className="mt-2">Start ordering delicious food!</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all border-none cursor-pointer"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.publicId || order.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {order.restaurantName || order.restaurant?.name || "Restaurant"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {order.items?.length || 0} item(s)
                    </div>
                  </div>
                  <span className={statusCls(order.status)}>
                    {order.status?.replace("_", " ")}
                  </span>
                </div>

                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-3 py-2 border-t border-gray-100 dark:border-gray-700">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.name || item.menuItem?.name} × {item.quantity}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-lg font-extrabold text-orange-500">
                    ₹{order.totalAmount?.toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => handleReorder(e, order.publicId)}
                    disabled={reorderingId === order.publicId}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
                  >
                    {reorderingId === order.publicId ? "Adding..." : "🔄 Reorder"}
                  </button>
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

