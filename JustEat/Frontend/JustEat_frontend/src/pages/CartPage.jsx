import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  getCart,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
} from "../api/cartApi";
import { placeOrder } from "../api/orderApi";

/*
  CartPage
  - Shows the current user's cart with items, quantities and total amount.
  - Supports: removing items, updating quantities, clearing the cart,
    and placing an order. All API interactions are delegated to the
    `cartApi` and `orderApi` helpers which return axios promises.
*/
const CartPage = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State: Cart object containing items array, totalAmount, and restaurant info
  const [cart, setCart] = useState(null);

  // State: Loading indicator for initial page load
  const [loading, setLoading] = useState(true);

  // State: Error message to display if operations fail
  const [error, setError] = useState("");

  // State: ID of cart item currently being removed (disables its remove button)
  const [removingId, setRemovingId] = useState(null);

  // State: ID of cart item whose quantity is being updated (disables quantity controls)
  const [updatingId, setUpdatingId] = useState(null);

  // State: Boolean indicating if entire cart is being cleared
  const [clearing, setClearing] = useState(false);

  // State: Boolean indicating if order is being placed
  const [placing, setPlacing] = useState(false);

  /**
   * Fetch cart data from API and handle various error scenarios
   */
  const fetchCart = async () => {
    // Show loading spinner
    setLoading(true);

    // Clear any previous error messages
    setError("");

    try {
      // Call API to get current user's cart
      const res = await getCart();

      // Update cart state with fetched data
      setCart(res.data);
    } catch (err) {
      // Handle different HTTP error codes appropriately

      // 404: Cart doesn't exist yet - show empty cart state
      if (err.response?.status === 404) {
        setCart({ items: [], totalAmount: 0 });
      }
      // 403: Authorization error - user needs to login again
      else if (err.response?.status === 403) {
        toast.error("Access denied. Please login again.");
        setError("Access denied.");
      }
      // 500: Server error - backend problem
      else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
        setError("Server error.");
      }
      // Other errors: Generic failure message
      else {
        setError("Failed to load cart.");
      }
    } finally {
      // Always hide loading spinner when done
      setLoading(false);
    }
  };

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCart();
  }, []); // Empty dependency array = run once on mount

  /**
   * Remove a single item from cart
   * @param {string} cartItemId - Unique identifier of cart item to remove
   */
  const handleRemove = async (cartItemId) => {
    // Set this item as being removed (disables its button)
    setRemovingId(cartItemId);

    try {
      // Call API to remove item from cart
      await removeCartItem(cartItemId);

      // Show success notification
      toast.success("Item removed");

      // Refresh cart to show updated items and total
      await fetchCart();
    } catch {
      // Show error notification if removal fails
      toast.error("Failed to remove item.");
    } finally {
      // Clear removing state (re-enables button)
      setRemovingId(null);
    }
  };

  /**
   * Update quantity of a cart item
   * @param {string} cartItemId - Unique identifier of cart item
   * @param {number} newQuantity - New quantity value
   */
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    // If quantity drops below 1, remove the item instead
    if (newQuantity < 1) {
      handleRemove(cartItemId);
      return;
    }

    // Set this item as being updated (disables quantity controls)
    setUpdatingId(cartItemId);

    try {
      // Call API to update item quantity
      await updateCartItemQuantity(cartItemId, newQuantity);

      // Refresh cart to reflect server-side calculations (subtotals, total)
      await fetchCart();
    } catch {
      // Show error notification if update fails
      toast.error("Failed to update quantity.");
    } finally {
      // Clear updating state (re-enables controls)
      setUpdatingId(null);
    }
  };

  /**
   * Clear all items from cart
   */
  const handleClear = async () => {
    // Set clearing state (disables clear button)
    setClearing(true);

    try {
      // Call API to clear entire cart
      await clearCart();

      // Immediately update local state to show empty cart
      setCart({ items: [], totalAmount: 0 });

      // Show success notification
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart.");
    } finally {
      setClearing(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Place an order for the current cart. On success navigate to orders.
    setPlacing(true);
    setError("");
    try {
      await placeOrder();
      toast.success("Order placed successfully!");
      setCart({ items: [], totalAmount: 0 });
      // Short delay so user sees the toast, then navigate to orders page.
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order.";
      toast.error(msg);
      setError(msg);
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

        {/* Error Alert */}
        {error && <div className="alert alert-danger">{error}</div>}

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
