import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createRestaurant } from "../api/restaurantApi";

/*
  CreateRestaurant.jsx
  - Page for restaurant owners to add a new restaurant.
  - Handles form inputs (text, textarea, select), multi-select cuisine
    checkboxes, image upload (FormData) and submission to backend.
*/

// Predefined options used in select/checkbox controls.
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

/*
  CreateRestaurant.jsx
  - Page for restaurant owners to add a new restaurant to their listings.
  - Form includes:
    * Basic fields: name, description, location (dropdown)
    * Multi-select cuisine types (checkboxes)
    * Image upload (required, sent as FormData)
  - Client-side validation ensures at least one cuisine type and image selected.
  - On success, redirects owner back to homepage after brief delay.
*/

/**
 * CreateRestaurant Page Component
 * Form for owners to create a new restaurant listing.
 */
const CreateRestaurant = () => {
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State: Form fields (name, description, location, and array of selected cuisines)
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    cuisineTypes: [], // Array to support multiple cuisine selections
  });

  // State: Selected image file (File object from file input)
  const [imageFile, setImageFile] = useState(null);

  // State: Error message to display if validation or API fails
  const [error, setError] = useState("");

  // State: Success message after restaurant is created
  const [success, setSuccess] = useState("");

  // State: Loading indicator during API call
  const [loading, setLoading] = useState(false);

  /**
   * Generic change handler for text/select/textarea inputs
   * Updates form state for the changed field
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Toggle a cuisine type in/out of the selection
   * @param {string} c - Cuisine type to toggle
   */
  const toggleCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      // If already selected, remove it; otherwise add it
      cuisineTypes: prev.cuisineTypes.includes(c)
        ? prev.cuisineTypes.filter((x) => x !== c) // Remove
        : [...prev.cuisineTypes, c], // Add
    }));
  };

  /**
   * Handle file input change
   * Stores the selected file in state for later upload
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  /**
   * Submit handler: validate form, build FormData with multipart content, and call API.
   * FormData is required because we're uploading an image file along with text fields.
   * Validates that at least one cuisine type is selected and an image is provided.
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission (page reload)
    e.preventDefault();

    // Client-side validation: Ensure at least one cuisine is selected
    if (form.cuisineTypes.length === 0) {
      setError("Please select at least one cuisine type.");
      return;
    }

    // Client-side validation: Ensure image is selected
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    // Clear previous errors and start loading
    setError("");
    setLoading(true);

    try {
      // Create FormData object for multipart file upload
      const formData = new FormData();

      // Append text fields
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("location", form.location);

      // Append each cuisine type separately (API expects multiple entries)
      form.cuisineTypes.forEach((cuisine) => {
        formData.append("cuisineTypes", cuisine);
      });

      // Append image file
      formData.append("image", imageFile);

      // Call API to create restaurant
      await createRestaurant(formData);

      // Show success message
      setSuccess("Restaurant created successfully!");

      // Navigate to home after brief delay (let user see success message)
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      // Extract error message from API response or use fallback
      setError(err.response?.data?.message || "Failed to create restaurant.");
    } finally {
      // Always hide loading indicator when done
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

        {/* Feedback messages */}
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

              {/* Location select */}
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

              {/* Image upload */}
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

              {/* Cuisine Types: checkbox grid with toggle on click */}
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

              {/* Submit button */}
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
