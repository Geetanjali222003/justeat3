import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../api/orderApi";

const statusCls = (status) => {
  const base = "text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide";
  const map = {
    PENDING: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400`,
    CONFIRMED: `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`,
    PREPARING: `${base} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400`,
    OUT_FOR_DELIVERY: `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400`,
    DELIVERED: `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`,
    CANCELLED: `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`,
  };
  return map[status] || base;
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
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>

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

        {!loading && order && (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.restaurant?.name || "Restaurant"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Order #{order.publicId?.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span className={statusCls(order.status)}>
                  {order.status?.replace("_", " ")}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
              </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Order Items
              </h2>
              <div className="flex flex-col gap-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.menuItem?.name || "Item"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ₹{item.price?.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-orange-500">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Total Amount
                </span>
                <span className="text-2xl font-extrabold text-orange-500">
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

