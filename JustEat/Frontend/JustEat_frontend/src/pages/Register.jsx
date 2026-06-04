import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerService, sendOtp } from "../auth/authService";

/*
  Register.jsx
  - Handles new user account creation with OTP verification.
  - Two-step process:
    1. User fills in details and requests OTP to be sent to their email
    2. After OTP is received, user enters it and submits to complete registration
  - Supports role selection (CUSTOMER or OWNER) which affects post-registration redirect
  - All form fields are controlled components with validation (phone pattern, password min length)
*/

/**
 * Register Page Component
 * Manages account creation with OTP verification for email confirmation.
 */
const Register = () => {
  const navigate = useNavigate();

  // Form state for all registration fields
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "MALE",
    location: "NOIDA",
    role: "CUSTOMER",
    otp: "",
  });

  // UI state for feedback and loading
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Generic change handler for all controlled inputs
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Send OTP to user's email for verification.
   * Validates email presence before making API call.
   */
  const handleSendOtp = async () => {
    if (!form.email) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setSuccess("");
    setOtpLoading(true);
    try {
      await sendOtp(form.email);
      setOtpSent(true);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Submit registration form after OTP verification.
   * Validates that OTP was sent and entered before calling register API.
   * On success, redirects to login (with owner dashboard hint for owners).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure OTP flow was completed
    if (!otpSent) {
      setError("Please send and verify OTP first");
      return;
    }
    if (!form.otp) {
      setError("Please enter the OTP");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await registerService(form);
      setSuccess("Registration successful! Redirecting to login...");
      // Brief delay to show success message, then redirect with role-based hint
      setTimeout(() => {
        navigate(
          form.role === "OWNER" ? "/login?next=owner-dashboard" : "/login",
        );
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div className="auth-card p-4 p-md-5">
          {/* Brand */}
          <div className="text-center mb-4">
            <div className="brand-logo mb-2">
              <span className="orange">Just</span>
              <span className="dark">Eat</span>
            </div>
            <p
              style={{ color: "var(--text-gray)", fontSize: "14px", margin: 0 }}
            >
              Create your account to get started
            </p>
          </div>

          {/* Alerts */}
          {error && <div className="alert-swiggy-error mb-3">{error}</div>}
          {success && (
            <div className="alert-swiggy-success mb-3">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-4">
              <label className="form-label">I am a</label>
              <div className="row g-3">
                <div className="col-6">
                  <div
                    className={`role-card ${form.role === "CUSTOMER" ? "active" : ""}`}
                    onClick={() => setForm({ ...form, role: "CUSTOMER" })}
                  >
                    <div className="icon">🛍️</div>
                    <div className="title">Customer</div>
                    <div className="subtitle">Order delicious food</div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className={`role-card ${form.role === "OWNER" ? "active" : ""}`}
                    onClick={() => setForm({ ...form, role: "OWNER" })}
                  >
                    <div className="icon">🍴</div>
                    <div className="title">Restaurant Owner</div>
                    <div className="subtitle">List your restaurant</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email with OTP */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-orange"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !form.email}
                  style={{ fontSize: "12px", padding: "14px 16px" }}
                >
                  {otpLoading ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {/* OTP Input */}
            {otpSent && (
              <div className="mb-3">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  className="form-control"
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  style={{
                    letterSpacing: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                />
              </div>
            )}

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                className="form-control"
                placeholder="10-digit mobile number"
                value={form.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
              />
            </div>

            {/* Gender and Location */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Location</label>
                <select
                  name="location"
                  className="form-select"
                  value={form.location}
                  onChange={handleChange}
                  required
                >
                  <option value="NOIDA">Noida</option>
                  <option value="DELHI">Delhi</option>
                  <option value="GURGAON">Gurgaon</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-orange w-100 mb-4"
              disabled={loading || !otpSent}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Login Link */}
            <p
              className="text-center mb-0"
              style={{ color: "var(--text-gray)", fontSize: "14px" }}
            >
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
