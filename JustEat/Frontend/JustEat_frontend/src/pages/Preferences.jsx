import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import {
  savePreferences,
  getPreferences,
  getRestaurants,
} from "../api/restaurantApi";
import { getMenu } from "../api/menuApi";

const CUISINES = [
  "INDIAN",
  "CHINESE",
  "JAPANESE",
  "ITALIAN",
  "MEXICAN",
  "CONTINENTAL",
  "FRENCH",
  "FAST_FOOD",
];
const DIETARY = ["VEG", "NON_VEG", "VEGAN"];

const Preferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Changed to arrays to match backend DTO
  const [favouriteCuisines, setFavouriteCuisines] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [favouriteRestaurants, setFavouriteRestaurants] = useState([]);
  const [favouriteFoods, setFavouriteFoods] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch preferences
        try {
          const prefRes = await getPreferences();
          const pref = prefRes.data || {};
          setFavouriteCuisines(pref.favouriteCuisines || []);
          setDietaryRestrictions(pref.dietaryRestrictions || []);
          // Map restaurant objects to IDs
          setFavouriteRestaurants(
            (pref.favouriteRestaurants || []).map((r) => r.publicId)
          );
          // Map food objects to IDs
          setFavouriteFoods((pref.favouriteFoods || []).map((f) => f.id));
        } catch {
          // No preferences yet
        }

        // Fetch restaurants for multi-select
        const restRes = await getRestaurants();
        setRestaurants(restRes.data || []);

        // Fetch all menu items from all restaurants
        const allFoods = [];
        for (const r of (restRes.data || []).slice(0, 5)) {
          try {
            const menuRes = await getMenu(r.publicId);
            (menuRes.data || []).forEach((item) => {
              allFoods.push({
                ...item,
                restaurantName: r.name,
                restaurantId: r.publicId,
              });
            });
          } catch {
            // ignore
          }
        }
        setFoods(allFoods);
      } catch {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCuisineToggle = (cuisine) => {
    setFavouriteCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleDietaryToggle = (dietary) => {
    setDietaryRestrictions((prev) =>
      prev.includes(dietary)
        ? prev.filter((d) => d !== dietary)
        : [...prev, dietary]
    );
  };

  const handleRestaurantToggle = (publicId) => {
    setFavouriteRestaurants((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId],
    );
  };

  const handleFoodToggle = (foodId) => {
    setFavouriteFoods((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePreferences({
        favouriteCuisines,
        dietaryRestrictions,
        restaurantIds: favouriteRestaurants,
        foodIds: favouriteFoods,
      });
      toast.success("Preferences saved successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: "700px" }}>
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        <h4 className="fw-bold mb-4">Your Preferences</h4>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Favourite Cuisines */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Favourite Cuisines (Select multiple)
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {CUISINES.map((c) => (
                    <div key={c} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`cuisine-${c}`}
                        checked={favouriteCuisines.includes(c)}
                        onChange={() => handleCuisineToggle(c)}
                      />
                      <label className="form-check-label" htmlFor={`cuisine-${c}`}>
                        {c.replace(/_/g, " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Dietary Restrictions (Select multiple)
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {DIETARY.map((d) => (
                    <div key={d} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`dietary-${d}`}
                        checked={dietaryRestrictions.includes(d)}
                        onChange={() => handleDietaryToggle(d)}
                      />
                      <label className="form-check-label" htmlFor={`dietary-${d}`}>
                        {d.replace(/_/g, " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favourite Restaurants */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Favourite Restaurants
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {restaurants.map((r) => (
                    <button
                      key={r.publicId}
                      type="button"
                      onClick={() => handleRestaurantToggle(r.publicId)}
                      className={`btn btn-sm ${favouriteRestaurants.includes(r.publicId) ? "btn-orange" : "btn-outline-secondary"}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
                {restaurants.length === 0 && (
                  <p className="text-muted small mb-0">
                    No restaurants available
                  </p>
                )}
              </div>

              {/* Favourite Foods */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Favourite Foods
                </label>
                <div
                  className="d-flex flex-wrap gap-2"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {foods.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFoodToggle(f.id)}
                      className={`btn btn-sm ${favouriteFoods.includes(f.id) ? "btn-orange" : "btn-outline-secondary"}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                {foods.length === 0 && (
                  <p className="text-muted small mb-0">No foods available</p>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-orange w-100"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Preferences;
