import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurants } from "../api/restaurantApi";
import { useAuth } from "../context/AuthContext";

const LOCATIONS = ["ALL", "NOIDA", "DELHI", "GURGAON"];

const Home = () => {
  const { userLocation } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState(userLocation || "ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getRestaurants(location === "ALL" ? null : location)
      .then((res) => setRestaurants(res.data))
      .catch(() => setError("Failed to load restaurants."))
      .finally(() => setLoading(false));
  }, [location]);

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
                    {r.rating != null && (
                      <div className="d-flex align-items-center gap-1">
                        <span
                          style={{
                            color: "var(--primary-orange)",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          ★ {r.rating.toFixed(1)}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          ({r.ratingCount})
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
