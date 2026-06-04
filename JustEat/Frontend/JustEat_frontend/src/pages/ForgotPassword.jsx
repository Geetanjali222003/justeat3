import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendResetOtp, resetPassword } from "../auth/authService";

/*
  ForgotPassword.jsx
  - Handles the 'forgot password' flow using an email + OTP verification.
  - Steps:
    1. User supplies email and requests an OTP (sendResetOtp).
    2. After OTP is sent, user enters OTP + new password and submits (resetPassword).
  - The component keeps UI state for loading, success/error messages and whether
    an OTP has been sent so the form can reveal OTP/password inputs.
*/

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Form fields: email, otp, new password
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  // UI state for messages and loading indicators
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Track whether an OTP has been sent and whether that request is in progress
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Generic change handler for controlled inputs
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Send a reset OTP to the provided email. Basic client-side validation
  // prevents calling the API without an email.
  const handleSendOtp = async () => {
    if (!form.email) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setSuccess("");
    setOtpLoading(true);
    try {
      await sendResetOtp(form.email);
      setOtpSent(true);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit the OTP + new password to reset the user's password. Ensures
  // OTP was requested and basic fields are populated before calling API.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      setError("Please send OTP first");
      return;
    }
    if (!form.otp || !form.newPassword) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setSuccess("Password reset successful! Redirecting to login...");
      // Short delay to show success message then navigate to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div className="auth-card p-4 p-md-5">
          {/* Brand header */}
          <div className="text-center mb-4">
            <div className="brand-logo mb-2">
              <span className="orange">Just</span>
              <span className="dark">Eat</span>
            </div>
            <p
              style={{ color: "var(--text-gray)", fontSize: "14px", margin: 0 }}
            >
              Reset your password
            </p>
          </div>

          {/* Alert messages */}
          {error && <div className="alert-swiggy-error mb-3">{error}</div>}
          {success && (
            <div className="alert-swiggy-success mb-3">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email input with a Send OTP button */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your registered email"
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

            {/* When OTP is sent reveal OTP and new password inputs */}
            {otpSent && (
              <>
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

                <div className="mb-4">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    placeholder="Enter new password"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            {/* Submit button becomes enabled after OTP is sent */}
            <button
              type="submit"
              className="btn btn-orange w-100 mb-4"
              disabled={loading || !otpSent}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {/* Divider and link back to login */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            <p
              className="text-center mb-0"
              style={{ color: "var(--text-gray)", fontSize: "14px" }}
            >
              Remember your password?{" "}
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

export default ForgotPassword;
