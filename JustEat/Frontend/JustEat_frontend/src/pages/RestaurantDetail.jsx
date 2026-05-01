import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurant } from "../api/restaurantApi";
import { getMenu } from "../api/menuApi";
import { addToCart } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

const dietCls = (d) => {
  const base = "text-xs font-bold px-2.5 py-0.5 rounded-full border";
  const map = {
    VEG: `${base} bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400  border-green-300  dark:border-green-700`,
    NON_VEG: `${base} bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400    border-red-300    dark:border-red-700`,
    EGG: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700`,
    VEGAN: `${base} bg-teal-100   dark:bg-teal-900/30   text-teal-700   dark:text-teal-400   border-teal-300   dark:border-teal-700`,
    JAIN: `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700`,
    GLUTEN_FREE: `${base} bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700`,
  };
  return map[d] || base;
};

const tagCls =
  "text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 capitalize";

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

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/")}
        >
          ← Back to restaurants
        </button>

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

        {!loading && restaurant && (
          <>
            <div className="relative w-full h-72 rounded-xl overflow-hidden mb-8">
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-8xl">
                  🍴
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-end p-6 text-white">
                <div>
                  <div className="text-4xl font-extrabold">
                    {restaurant.name}
                  </div>
                  <div className="text-sm opacity-85 mt-1">
                    {restaurant.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center mb-8">
              <span className={tagCls}>📍 {restaurant.location}</span>
              {(restaurant.cuisineTypes || []).map((c) => (
                <span key={c} className={tagCls}>
                  {c.replace("_", " ")}
                </span>
              ))}
              {restaurant.restaurantStatus && (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                    restaurant.restaurantStatus === "OPEN"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {restaurant.restaurantStatus}
                </span>
              )}
              {restaurant.rating != null && (
                <span className="flex items-center gap-1 text-sm font-bold text-orange-700 dark:text-orange-400">
                  ★ {restaurant.rating.toFixed(1)} ({restaurant.ratingCount})
                </span>
              )}
            </div>

            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Menu
              </div>
              {cartMessage && (
                <div
                  className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                    cartMessage.includes("Added")
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {cartMessage}
                </div>
              )}
            </div>

            {menu.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No menu items yet
                </h3>
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                }}
              >
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md flex flex-col gap-2 ${
                      !item.available ? "opacity-40" : ""
                    }`}
                  >
                    <div className="font-bold text-base text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-lg font-extrabold text-orange-500">
                      ₹{item.price?.toFixed(2)}
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className={dietCls(item.dietaryRestriction)}>
                        {item.dietaryRestriction?.replace("_", " ") ||
                          item.cuisineType}
                      </span>
                      {!item.available && (
                        <span className="text-xs text-gray-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                    {/* Add to Cart Button - Only for Customers */}
                    {role === "CUSTOMER" && item.available && (
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        disabled={addingItemId === item.id}
                        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
                      >
                        {addingItemId === item.id ? "Adding..." : "Add to Cart"}
                      </button>
                    )}
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
