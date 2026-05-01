import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItemCard from "../components/CartItemCard";
import { getCart, removeCartItem, clearCart } from "../api/cartApi";
import { placeOrder } from "../api/orderApi";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setCart({ items: [], totalAmount: 0 });
      } else {
        setError("Failed to load cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId);
    try {
      await removeCartItem(cartItemId);
      await fetchCart();
    } catch {
      setError("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearCart();
      setCart({ items: [], totalAmount: 0 });
    } catch {
      setError("Failed to clear cart.");
    } finally {
      setClearing(false);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError("");
    setSuccess("");
    try {
      await placeOrder();
      setSuccess("Order placed successfully!");
      setCart({ items: [], totalAmount: 0 });
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  const isEmpty = !cart?.items?.length;

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-4xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Cart
        </h1>

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

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm mb-4">
            {success}
          </div>
        )}

        {!loading && isEmpty && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Your cart is empty
            </h3>
            <p className="mt-2">Add some delicious items to your cart!</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all border-none cursor-pointer"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {!loading && !isEmpty && (
          <>
            {/* Restaurant Name */}
            {cart.restaurant && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                From:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {cart.restaurant.name}
                </span>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex flex-col gap-3 mb-6">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  removing={removingId === item.id}
                />
              ))}
            </div>

            {/* Total */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Total Amount
                </span>
                <span className="text-2xl font-extrabold text-orange-500">
                  ₹{cart.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleClear}
                disabled={clearing}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent"
              >
                {clearing ? "Clearing..." : "Clear Cart"}
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer flex-1 sm:flex-none"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;

