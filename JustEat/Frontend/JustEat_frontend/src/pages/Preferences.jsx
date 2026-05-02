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

  const [favouriteCuisine, setFavouriteCuisine] = useState("");
  const [dietaryRestriction, setDietaryRestriction] = useState("");
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
          setFavouriteCuisine(pref.favouriteCuisine || "");
          setDietaryRestriction(pref.dietaryRestriction || "");
          setFavouriteRestaurants(pref.favouriteRestaurants || []);
          setFavouriteFoods(pref.favouriteFoods || []);
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
        favouriteCuisine,
        dietaryRestriction,
        favouriteRestaurants,
        favouriteFoods,
      });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
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
              {/* Favourite Cuisine */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Favourite Cuisine
                </label>
                <select
                  className="form-select"
                  value={favouriteCuisine}
                  onChange={(e) => setFavouriteCuisine(e.target.value)}
                >
                  <option value="">Select cuisine</option>
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Restriction */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Dietary Restriction
                </label>
                <select
                  className="form-select"
                  value={dietaryRestriction}
                  onChange={(e) => setDietaryRestriction(e.target.value)}
                >
                  <option value="">Select dietary preference</option>
                  {DIETARY.map((d) => (
                    <option key={d} value={d}>
                      {d.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
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
