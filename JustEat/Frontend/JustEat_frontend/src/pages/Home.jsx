import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurants } from "../api/restaurantApi";
import { useAuth } from "../context/AuthContext";

const LOCATIONS = ["ALL", "NOIDA", "DELHI", "GURGAON"];

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

const tagCls =
  "text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 capitalize";

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

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Restaurants near you
        </h1>

        <div className="flex gap-3 flex-wrap mb-8">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`border-2 font-semibold text-sm px-4 py-1.5 rounded-full cursor-pointer transition-all ${
                location === loc
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

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

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              No restaurants found
            </h3>
            <p>Try a different location or check back later.</p>
          </div>
        )}

        {!loading && !error && (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {restaurants.map((r) => (
              <Link
                key={r.publicId}
                to={`/restaurant/${r.publicId}`}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all no-underline text-gray-900 dark:text-white block"
              >
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-5xl">
                    🍴
                  </div>
                )}
                <div className="p-4">
                  <div className="font-bold text-base mb-1">{r.name}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-3 truncate">
                    {r.description}
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                      {(r.cuisineTypes || []).slice(0, 3).map((c) => (
                        <span key={c} className={tagCls}>
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    <span className={statusCls(r.restaurantStatus)}>
                      {r.restaurantStatus || "OPEN"}
                    </span>
                  </div>
                  {r.rating != null && (
                    <div className="flex items-center gap-1 text-sm font-bold text-orange-700 dark:text-orange-400 mt-2">
                      ★ {r.rating.toFixed(1)}
                      <span className="text-gray-400 font-normal">
                        &nbsp;({r.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
