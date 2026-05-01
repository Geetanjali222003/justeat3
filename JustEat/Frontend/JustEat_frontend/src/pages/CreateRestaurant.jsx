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
      <div className="container py-4" style={{ maxWidth: "600px" }}>
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
        <h1 className="h4 fw-bold mb-4">Add New Restaurant</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {/* Restaurant Name */}
              <div className="mb-3">
                <label className="form-label">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Spice Garden"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Tell customers what makes you special…"
                  value={form.description}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Location */}
              <div className="mb-3">
                <label className="form-label">Location</label>
                <select
                  name="location"
                  className="form-select"
                  value={form.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select city</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div className="mb-3">
                <label className="form-label">Restaurant Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                  required
                />
                {imageFile && (
                  <small className="text-muted">
                    Selected: {imageFile.name}
                  </small>
                )}
              </div>

              {/* Cuisine Types */}
              <div className="mb-4">
                <label className="form-label">Cuisine Types</label>
                <div className="row g-2">
                  {CUISINE_TYPES.map((c) => (
                    <div key={c} className="col-6 col-md-4">
                      <div
                        className={`form-check border rounded p-2 ${
                          form.cuisineTypes.includes(c)
                            ? "border-warning bg-warning bg-opacity-10"
                            : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleCuisine(c)}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={form.cuisineTypes.includes(c)}
                          onChange={() => toggleCuisine(c)}
                          style={{ accentColor: "var(--primary-orange)" }}
                        />
                        <label
                          className="form-check-label small"
                          style={{ cursor: "pointer" }}
                        >
                          {c.replace("_", " ")}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-orange w-100"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Restaurant"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateRestaurant;
