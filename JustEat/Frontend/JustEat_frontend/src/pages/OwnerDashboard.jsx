import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyRestaurants } from "../api/restaurantApi";

const statusCls = (status) => {
  const base =
    "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  const s = (status || "OPEN").toUpperCase();
  if (s === "OPEN")
    return `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`;
  if (s === "CLOSED")
    return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`;
  return `${base} bg-yellow-100 dark:bg-yellow-900/30 text-orange-700 dark:text-orange-400`;
};

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              My Restaurants
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your listings on JustEat
            </p>
          </div>
          <button
            onClick={() => navigate("/create-restaurant")}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer border-none"
          >
            + Add Restaurant
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-24">
            <div className="text-7xl mb-5">🏪</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              You haven&apos;t listed any restaurants yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Create your first restaurant listing and start receiving orders.
            </p>
            <button
              onClick={() => navigate("/create-restaurant")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer border-none text-sm"
            >
              + Create My First Restaurant
            </button>
          </div>
        )}

        {/* Restaurant cards */}
        {!loading && !error && restaurants.length > 0 && (
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {restaurants.map((r) => (
              <div
                key={r.publicId}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md flex flex-col"
              >
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                      {r.name}
                    </h3>
                    <span className={statusCls(r.restaurantStatus)}>
                      {r.restaurantStatus || "OPEN"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {r.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      📍 {r.location}
                    </span>
                    {(r.cuisineTypes || []).slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 capitalize"
                      >
                        {c.toLowerCase().replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={() => navigate(`/restaurant/${r.publicId}`)}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer border-none"
                    >
                      View
                    </button>
                    <button
                      className="flex-1 text-xs font-semibold py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer border-none"
                      onClick={() =>
                        navigate(`/manage-restaurant/${r.publicId}`)
                      }
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
