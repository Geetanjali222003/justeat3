import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyRestaurants } from "../api/restaurantApi";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRestaurants()
      .then((res) => setRestaurants(res.data))
      .catch(() => setError("Failed to load your restaurants."))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h4 fw-bold mb-1"
              style={{ color: "var(--text-dark)" }}
            >
              My Restaurants
            </h1>
            <p className="text-muted small mb-0">Manage your listings</p>
          </div>
          <button
            onClick={() => navigate("/create-restaurant")}
            className="btn btn-orange"
          >
            + Add Restaurant
          </button>
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
            <div style={{ fontSize: "4rem" }}>🏪</div>
            <h5 className="mt-3">No restaurants yet</h5>
            <p className="text-muted">Create your first restaurant listing</p>
            <button
              onClick={() => navigate("/create-restaurant")}
              className="btn btn-orange mt-3"
            >
              + Create Restaurant
            </button>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="row g-4">
            {restaurants.map((r) => (
              <div key={r.publicId} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="card-img-top"
                      style={{ height: "140px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center"
                      style={{
                        height: "140px",
                        background: "#fff5eb",
                        fontSize: "2.5rem",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title fw-bold mb-0">{r.name}</h6>
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.description}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
                      <span>📍 {r.location}</span>
                      {(r.cuisineTypes || []).slice(0, 1).map((c) => (
                        <span
                          key={c}
                          className="badge"
                          style={{
                            backgroundColor: "#fff5eb",
                            color: "var(--primary-orange)",
                            fontSize: "10px",
                          }}
                        >
                          {c.toLowerCase().replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/restaurant/${r.publicId}`)}
                        className="btn btn-outline-secondary btn-sm flex-fill"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/manage-restaurant/${r.publicId}`)
                        }
                        className="btn btn-orange btn-sm flex-fill"
                      >
                        Manage
                      </button>
                    </div>
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

export default OwnerDashboard;
