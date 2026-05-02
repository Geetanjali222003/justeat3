import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile, updateProfileImage } from "../api/profileApi";

const LOCATIONS = [
  "DELHI",
  "MUMBAI",
  "BANGALORE",
  "HYDERABAD",
  "CHENNAI",
  "KOLKATA",
  "PUNE",
  "AHMEDABAD",
];

const GENDERS = ["MALE", "FEMALE", "OTHER"];

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    location: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.data);
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        phoneNumber: res.data.phoneNumber || "",
        gender: res.data.gender || "",
        location: res.data.location || "",
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateProfile(formData);
      setProfile(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await updateProfileImage(file);
      setProfile(res.data);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const getInitials = () => {
    if (!profile) return "U";
    return `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        <button
          className="btn btn-link text-muted p-0 mb-3 text-decoration-none"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 className="h4 fw-bold mb-4">My Profile</h1>

        <div className="row g-4">
          {/* Profile Picture Card */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="position-relative d-inline-block mb-3">
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      border: "3px solid var(--primary-orange)",
                      backgroundColor: profile?.profileImageUrl
                        ? "transparent"
                        : "var(--primary-orange)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "40px",
                      fontWeight: "600",
                      color: "white",
                      overflow: "hidden",
                      margin: "0 auto",
                    }}
                  >
                    {profile?.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>

                  {uploadingImage && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>

                <h6 className="fw-bold mb-1">
                  {profile?.firstName} {profile?.lastName}
                </h6>
                <p className="text-muted small mb-3">{profile?.email}</p>

                <label
                  htmlFor="profileImageInput"
                  className="btn btn-sm btn-orange w-100"
                  style={{ cursor: "pointer" }}
                >
                  📷 Change Picture
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Profile Details</h6>
                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={profile?.email}
                        disabled
                        style={{ backgroundColor: "#f5f5f5" }}
                      />
                      <small className="text-muted">Email cannot be changed</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        pattern="[0-9]{10}"
                        maxLength="10"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Gender
                      </label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">
                        Location
                      </label>
                      <select
                        className="form-select"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Location</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <div
                        className="p-3 rounded"
                        style={{ backgroundColor: "#fff5eb" }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ fontSize: "20px" }}>
                            {profile?.role === "OWNER" ? "🏪" : "🍔"}
                          </span>
                          <div>
                            <div className="fw-semibold small">Account Type</div>
                            <div className="text-muted" style={{ fontSize: "13px" }}>
                              {profile?.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-orange flex-fill"
                      disabled={updating}
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

