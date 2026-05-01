import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createRestaurant } from "../api/restaurantApi";

const LOCATIONS = ["NOIDA", "DELHI", "GURGAON"];
const CUISINE_TYPES = [
  "INDIAN",
  "CHINESE",
  "JAPANESE",
  "ITALIAN",
  "MEXICAN",
  "CONTINENTAL",
  "FRENCH",
  "FAST_FOOD",
];

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    cuisineTypes: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(c)
        ? prev.cuisineTypes.filter((x) => x !== c)
        : [...prev.cuisineTypes, c],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.cuisineTypes.length === 0) {
      setError("Please select at least one cuisine type.");
      return;
    }
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("location", form.location);
      form.cuisineTypes.forEach((cuisine) => {
        formData.append("cuisineTypes", cuisine);
      });
      formData.append("image", imageFile);

      await createRestaurant(formData);
      setSuccess("Restaurant created successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create restaurant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-2xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Add New Restaurant
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm mb-4">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Restaurant Name</label>
                <input
                  name="name"
                  placeholder="e.g. Spice Garden"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Description</label>
                <textarea
                  name="description"
                  placeholder="Tell customers what makes you special…"
                  value={form.description}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  className={`${inputCls} resize-y min-h-20`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Location</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className={inputCls}
                >
                  <option value="">Select city</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Restaurant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className={inputCls}
                />
                {imageFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Cuisine Types</label>
                <div
                  className="grid gap-2 mt-1"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                  }}
                >
                  {CUISINE_TYPES.map((c) => (
                    <label
                      key={c}
                      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer text-sm font-semibold transition-all ${
                        form.cuisineTypes.includes(c)
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.cuisineTypes.includes(c)}
                        onChange={() => toggleCuisine(c)}
                        className="accent-orange-500"
                      />
                      {c.replace("_", " ")}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all cursor-pointer border-none"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create Restaurant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRestaurant;
