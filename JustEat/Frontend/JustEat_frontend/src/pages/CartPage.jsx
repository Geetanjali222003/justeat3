import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
      <div className="container py-4" style={{ maxWidth: "700px" }}>
        {/* Back Button */}
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 className="h4 fw-bold mb-4">Your Cart</h1>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Empty State */}
        {!loading && isEmpty && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>🛒</div>
            <h5 className="mt-3">Your cart is empty</h5>
            <p className="text-muted">Add some delicious items!</p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-orange mt-3"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Cart Items */}
        {!loading && !isEmpty && (
          <>
            {/* Restaurant Name */}
            {cart.restaurant && (
              <p className="text-muted small mb-3">
                From: <strong>{cart.restaurant.name}</strong>
              </p>
            )}

            {/* Items List */}
            <div className="card border-0 shadow-sm mb-4">
              <ul className="list-group list-group-flush">
                {cart.items.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex justify-content-between align-items-center py-3"
                  >
                    <div>
                      <h6 className="mb-1 fw-semibold">
                        {item.menuItem?.name || item.name}
                      </h6>
                      <small className="text-muted">
                        ₹{item.menuItem?.price || item.price} × {item.quantity}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className="fw-bold"
                        style={{ color: "var(--primary-orange)" }}
                      >
                        ₹
                        {(
                          (item.menuItem?.price || item.price) * item.quantity
                        ).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="btn btn-sm btn-outline-danger"
                      >
                        {removingId === item.id ? "..." : "×"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body d-flex justify-content-between align-items-center">
                <span className="h6 mb-0">Total Amount</span>
                <span
                  className="h4 mb-0 fw-bold"
                  style={{ color: "var(--primary-orange)" }}
                >
                  ₹{cart.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-3">
              <button
                onClick={handleClear}
                disabled={clearing}
                className="btn btn-outline-secondary"
              >
                {clearing ? "Clearing..." : "Clear Cart"}
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn btn-orange flex-fill"
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
