import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  getRestaurants,
  getMostOrdered,
  getSpecials,
  getRecommendations,
} from "../api/restaurantApi";
import { addToCart } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

const LOCATIONS = ["ALL", "NOIDA", "DELHI", "GURGAON"];

const Home = () => {
  const { userLocation, role, user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState(userLocation || "ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Most Ordered
  const [mostOrdered, setMostOrdered] = useState([]);
  const [mostOrderedLoading, setMostOrderedLoading] = useState(true);
  const [addingItemId, setAddingItemId] = useState(null);

  // Specials
  const [specials, setSpecials] = useState([]);
  const [specialsLoading, setSpecialsLoading] = useState(true);

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    getRestaurants(location === "ALL" ? null : location)
      .then((res) => setRestaurants(res.data))
      .catch(() => setError("Failed to load restaurants."))
      .finally(() => setLoading(false));
  }, [location]);

  useEffect(() => {
    if (role === "CUSTOMER") {
      // Most Ordered
      setMostOrderedLoading(true);
      getMostOrdered()
        .then((res) => setMostOrdered(res.data || []))
        .catch(() => setMostOrdered([]))
        .finally(() => setMostOrderedLoading(false));

      // Specials
      setSpecialsLoading(true);
      getSpecials()
        .then((res) => setSpecials(res.data || []))
        .catch(() => setSpecials([]))
        .finally(() => setSpecialsLoading(false));

      // Recommendations
      if (user?.id || user?.publicId) {
        setRecommendationsLoading(true);
        getRecommendations(user.id || user.publicId)
          .then((res) => setRecommendations(res.data || []))
          .catch(() => setRecommendations([]))
          .finally(() => setRecommendationsLoading(false));
      } else {
        setRecommendationsLoading(false);
      }
    }
  }, [role, user]);

  const handleAddToCart = async (menuItemId) => {
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

  const getStatusBadge = (status) => {
    const s = (status || "OPEN").toUpperCase();
    if (s === "OPEN") return "bg-success";
    if (s === "CLOSED") return "bg-danger";
    return "bg-warning";
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h4 fw-bold mb-1" style={{ color: "var(--text-dark)" }}>
            Restaurants near you
          </h1>
          <p className="text-muted small mb-0">Discover the best food around</p>
        </div>

        {/* Location Filter */}
        <div className="d-flex gap-2 flex-wrap mb-4">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`btn btn-sm ${
                location === loc ? "btn-orange" : "btn-outline-secondary"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-5">
            <div style={{ fontSize: "4rem" }}>🍽️</div>
            <h5 className="mt-3">No restaurants found</h5>
            <p className="text-muted">Try a different location</p>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="row g-4">
            {restaurants.map((r) => (
              <div key={r.publicId} className="col-12 col-sm-6 col-lg-4">
                <Link
                  to={`/restaurant/${r.publicId}`}
                  className="card h-100 text-decoration-none border-0 shadow-sm"
                  style={{ transition: "transform 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-4px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="card-img-top"
                      style={{ height: "160px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center"
                      style={{
                        height: "160px",
                        background: "linear-gradient(135deg, #fff5eb, #ffe8d6)",
                        fontSize: "3rem",
                      }}
                    >
                      🍴
                    </div>
                  )}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6
                        className="card-title fw-bold mb-0"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {r.name}
                      </h6>
                      <span
                        className={`badge ${getStatusBadge(r.restaurantStatus)}`}
                        style={{ fontSize: "10px" }}
                      >
                        {r.restaurantStatus || "OPEN"}
                      </span>
                    </div>
                    <p
                      className="card-text text-muted small mb-2"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.description}
                    </p>
                    <div className="d-flex gap-1 flex-wrap mb-2">
                      {(r.cuisineTypes || []).slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="badge"
                          style={{
                            backgroundColor: "var(--primary-orange-light)",
                            color: "var(--primary-orange)",
                            fontWeight: "500",
                            fontSize: "10px",
                          }}
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <span style={{ color: "#ffc107", fontSize: "14px" }}>
                        ⭐
                      </span>
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "14px" }}
                      >
                        {r.rating != null ? r.rating.toFixed(1) : "0.0"} / 5
                      </span>
                      {r.ratingCount > 0 && (
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          ({r.ratingCount})
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Most Ordered Section - Only for Customers */}
        {role === "CUSTOMER" && (
          <div className="mt-5">
            <h4 className="fw-bold mb-3">🔥 Most Ordered Items</h4>

            {mostOrderedLoading && (
              <div className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm text-warning"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!mostOrderedLoading && mostOrdered.length === 0 && (
              <p className="text-muted">No popular items yet.</p>
            )}

            {!mostOrderedLoading && mostOrdered.length > 0 && (
              <div className="row g-4">
                {mostOrdered.map((item) => (
                  <div
                    key={item.menuItemId || item.id}
                    className="col-12 col-sm-6 col-lg-3"
                  >
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">
                            {item.menuItemName || item.name}
                          </h6>
                          <span
                            className="badge bg-danger"
                            style={{ fontSize: "10px" }}
                          >
                            Popular
                          </span>
                        </div>
                        <p className="text-muted small mb-2">
                          {item.restaurantName}
                        </p>
                        <p
                          className="fw-bold mb-3"
                          style={{ color: "var(--primary-orange)" }}
                        >
                          ₹{item.price?.toFixed(2) || "0.00"}
                        </p>
                        <button
                          onClick={() =>
                            handleAddToCart(item.menuItemId || item.id)
                          }
                          disabled={
                            addingItemId === (item.menuItemId || item.id)
                          }
                          className="btn btn-orange btn-sm w-100"
                        >
                          {addingItemId === (item.menuItemId || item.id)
                            ? "Adding..."
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today's Specials Section */}
        {role === "CUSTOMER" && (
          <div className="mt-5">
            <h4 className="fw-bold mb-3">🔥 Today&apos;s Specials</h4>

            {specialsLoading && (
              <div className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm text-warning"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!specialsLoading && specials.length === 0 && (
              <p className="text-muted">No specials today.</p>
            )}

            {!specialsLoading && specials.length > 0 && (
              <div className="row g-4">
                {specials.map((item) => (
                  <div
                    key={item.menuItemId || item.id}
                    className="col-12 col-sm-6 col-lg-3"
                  >
                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={
                        item.isDealOfDay ? { border: "2px solid #fc8019" } : {}
                      }
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">
                            {item.menuItemName || item.name}
                          </h6>
                          <div className="d-flex gap-1">
                            <span
                              className="badge bg-warning text-dark"
                              style={{ fontSize: "10px" }}
                            >
                              Special
                            </span>
                            {item.isDealOfDay && (
                              <span
                                className="badge bg-success"
                                style={{ fontSize: "10px" }}
                              >
                                Deal
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-muted small mb-2">
                          {item.restaurantName}
                        </p>
                        {item.cuisineType && (
                          <span
                            className="badge bg-light text-dark mb-2"
                            style={{ fontSize: "10px" }}
                          >
                            {item.cuisineType?.replace(/_/g, " ")}
                          </span>
                        )}
                        <p
                          className="fw-bold mb-3"
                          style={{ color: "var(--primary-orange)" }}
                        >
                          ₹{item.price?.toFixed(2) || "0.00"}
                        </p>
                        <button
                          onClick={() =>
                            handleAddToCart(item.menuItemId || item.id)
                          }
                          disabled={
                            addingItemId === (item.menuItemId || item.id)
                          }
                          className="btn btn-warning btn-sm w-100"
                        >
                          {addingItemId === (item.menuItemId || item.id)
                            ? "Adding..."
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        {role === "CUSTOMER" && (
          <div className="mt-5">
            <h4 className="fw-bold mb-3">✨ Recommended for You</h4>

            {recommendationsLoading && (
              <div className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm text-warning"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!recommendationsLoading && recommendations.length === 0 && (
              <p className="text-muted">
                No recommendations yet. Update your{" "}
                <Link
                  to="/preferences"
                  style={{ color: "var(--primary-orange)" }}
                >
                  preferences
                </Link>{" "}
                to get personalized suggestions!
              </p>
            )}

            {!recommendationsLoading && recommendations.length > 0 && (
              <div className="row g-4">
                {recommendations.map((item) => (
                  <div
                    key={item.menuItemId || item.id}
                    className="col-12 col-sm-6 col-lg-3"
                  >
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="fw-bold mb-2">
                          {item.menuItemName || item.name}
                        </h6>
                        <p className="text-muted small mb-1">
                          {item.restaurantName}
                        </p>
                        {item.cuisineType && (
                          <span
                            className="badge bg-light text-dark mb-2"
                            style={{ fontSize: "10px" }}
                          >
                            {item.cuisineType?.replace(/_/g, " ")}
                          </span>
                        )}
                        <p
                          className="fw-bold mb-3"
                          style={{ color: "var(--primary-orange)" }}
                        >
                          ₹{item.price?.toFixed(2) || "0.00"}
                        </p>
                        <button
                          onClick={() =>
                            handleAddToCart(item.menuItemId || item.id)
                          }
                          disabled={
                            addingItemId === (item.menuItemId || item.id)
                          }
                          className="btn btn-orange btn-sm w-100"
                        >
                          {addingItemId === (item.menuItemId || item.id)
                            ? "Adding..."
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
