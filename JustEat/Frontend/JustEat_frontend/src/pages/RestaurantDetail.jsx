import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getRestaurant, getOwnerRestaurant, submitRating } from "../api/restaurantApi";
import { getMenu, getOwnerMenu } from "../api/menuApi";
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

  // Rating state
  const [selectedRating, setSelectedRating] = useState("5");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Use owner endpoints if user is OWNER, customer endpoints if CUSTOMER
    const restaurantApi = role === "OWNER" ? getOwnerRestaurant : getRestaurant;
    const menuApi = role === "OWNER" ? getOwnerMenu : getMenu;

    Promise.all([restaurantApi(publicId), menuApi(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
      })
      .catch((err) => {
        console.error("Failed to load restaurant:", err);
        setError("Failed to load restaurant details.");
      })
      .finally(() => setLoading(false));
  }, [publicId, role]);

  const handleAddToCart = async (menuItemId) => {
    if (role === "OWNER") {
      toast.error("Owners cannot add items to cart");
      return;
    }
    setAddingItemId(menuItemId);
    try {
      await addToCart(menuItemId, 1);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingItemId(null);
    }
  };

  const handleSubmitRating = async () => {
    if (role === "OWNER") {
      toast.error("Owners cannot rate restaurants");
      return;
    }
    setRatingSubmitting(true);
    try {
      await submitRating(publicId, parseInt(selectedRating));
      toast.success("Rating submitted successfully");
      const res = await getRestaurant(publicId);
      setRestaurant(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const getDietBadge = (diet) => {
    const map = {
      VEG: { bg: "#e8f5e9", color: "#2e7d32" },
      NON_VEG: { bg: "#ffebee", color: "#c62828" },
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
                  <span className="badge bg-light text-dark d-flex align-items-center gap-1">
                    <span style={{ color: "#ffc107" }}>⭐</span>
                    <span className="fw-semibold">
                      {restaurant.rating != null
                        ? restaurant.rating.toFixed(1)
                        : "0.0"}{" "}
                      / 5
                    </span>
                    {restaurant.ratingCount > 0 && (
                      <span className="text-muted">
                        ({restaurant.ratingCount})
                      </span>
                    )}
                  </span>
                </div>

                {/* Rating Submission UI - Only for Customers */}
                {role === "CUSTOMER" && (
                  <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top">
                    <span className="small text-muted">
                      Rate this restaurant:
                    </span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "70px" }}
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <button
                      className="btn btn-orange btn-sm"
                      onClick={handleSubmitRating}
                      disabled={ratingSubmitting}
                    >
                      {ratingSubmitting ? "..." : "Submit Rating"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Menu</h5>
            </div>

            {menu.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "4rem" }}>🍽️</div>
                <h5 className="mt-3">No menu items yet</h5>
              </div>
            ) : (
              <div className="row g-4">
                {menu.map((item) => (
                  <div key={item.id} className="col-12 col-sm-6 col-lg-4">
                    <div
                      className={`card h-100 shadow-sm ${!item.available ? "opacity-50" : ""}`}
                      style={
                        item.isDealOfDay
                          ? { border: "2px solid #fc8019" }
                          : { border: "none" }
                      }
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title fw-bold mb-0">
                            {item.name}
                          </h6>
                          <div className="d-flex gap-1">
                            {item.isSpecial && (
                              <span
                                className="badge bg-warning text-dark"
                                style={{ fontSize: "10px" }}
                              >
                                Special
                              </span>
                            )}
                            {item.isDealOfDay && (
                              <span
                                className="badge bg-success"
                                style={{ fontSize: "10px" }}
                              >
                                Deal
                              </span>
                            )}
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
