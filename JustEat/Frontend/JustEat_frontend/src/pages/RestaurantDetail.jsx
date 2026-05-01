import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurant } from "../api/restaurantApi";
import { getMenu } from "../api/menuApi";
import { addToCart } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

const RestaurantDetail = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingItemId, setAddingItemId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getRestaurant(publicId), getMenu(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
      })
      .catch(() => setError("Failed to load restaurant details."))
      .finally(() => setLoading(false));
  }, [publicId]);

  const handleAddToCart = async (menuItemId) => {
    setAddingItemId(menuItemId);
    setCartMessage("");
    try {
      await addToCart(menuItemId, 1);
      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(""), 2000);
    } catch (err) {
      setCartMessage(err.response?.data?.message || "Failed to add to cart");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setAddingItemId(null);
    }
  };

  const getDietBadge = (diet) => {
    const map = {
      VEG: { bg: "#e8f5e9", color: "#2e7d32" },
      NON_VEG: { bg: "#ffebee", color: "#c62828" },
      EGG: { bg: "#fff3e0", color: "#e65100" },
      VEGAN: { bg: "#e0f2f1", color: "#00695c" },
    };
    return map[diet] || { bg: "#f5f5f5", color: "#666" };
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Back Button */}
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/")}
        >
          ← Back to restaurants
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && restaurant && (
          <>
            {/* Restaurant Header */}
            <div className="card border-0 shadow-sm mb-4 overflow-hidden">
              <div className="position-relative">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      height: "220px",
                      background: "linear-gradient(135deg, #fff5eb, #ffe8d6)",
                      fontSize: "5rem",
                    }}
                  >
                    🍴
                  </div>
                )}
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-4"
                  style={{
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  }}
                >
                  <h2 className="text-white fw-bold mb-1">{restaurant.name}</h2>
                  <p className="text-white-50 mb-0 small">
                    {restaurant.description}
                  </p>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge bg-light text-dark">
                    📍 {restaurant.location}
                  </span>
                  {(restaurant.cuisineTypes || []).map((c) => (
                    <span
                      key={c}
                      className="badge"
                      style={{
                        backgroundColor: "#fff5eb",
                        color: "var(--primary-orange)",
                      }}
                    >
                      {c.replace("_", " ")}
                    </span>
                  ))}
                  {restaurant.restaurantStatus && (
                    <span
                      className={`badge ${restaurant.restaurantStatus === "OPEN" ? "bg-success" : "bg-danger"}`}
                    >
                      {restaurant.restaurantStatus}
                    </span>
                  )}
                  {restaurant.rating != null && (
                    <span className="badge bg-warning text-dark">
                      ★ {restaurant.rating.toFixed(1)} ({restaurant.ratingCount}
                      )
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Menu</h5>
              {cartMessage && (
                <span
                  className={`badge ${cartMessage.includes("Added") ? "bg-success" : "bg-danger"}`}
                >
                  {cartMessage}
                </span>
              )}
            </div>

            {menu.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "4rem" }}>🍽️</div>
                <h5 className="mt-3">No menu items yet</h5>
              </div>
            ) : (
              <div className="row g-3">
                {menu.map((item) => (
                  <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                    <div
                      className={`card h-100 border-0 shadow-sm ${!item.available ? "opacity-50" : ""}`}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title fw-bold mb-0">
                            {item.name}
                          </h6>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: getDietBadge(
                                item.dietaryRestriction,
                              ).bg,
                              color: getDietBadge(item.dietaryRestriction)
                                .color,
                              fontSize: "10px",
                            }}
                          >
                            {item.dietaryRestriction?.replace("_", " ") ||
                              "VEG"}
                          </span>
                        </div>
                        <p
                          className="h5 fw-bold mb-3"
                          style={{ color: "var(--primary-orange)" }}
                        >
                          ₹{item.price?.toFixed(2)}
                        </p>
                        {!item.available && (
                          <span className="badge bg-secondary mb-2">
                            Unavailable
                          </span>
                        )}
                        {role === "CUSTOMER" && item.available && (
                          <button
                            onClick={() => handleAddToCart(item.id)}
                            disabled={addingItemId === item.id}
                            className="btn btn-orange btn-sm w-100"
                          >
                            {addingItemId === item.id
                              ? "Adding..."
                              : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RestaurantDetail;
