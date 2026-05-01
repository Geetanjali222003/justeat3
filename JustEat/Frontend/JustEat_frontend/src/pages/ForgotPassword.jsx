import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendResetOtp, resetPassword } from "../auth/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
          {/* Brand */}
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

          {/* Alerts */}
          {error && <div className="alert-swiggy-error mb-3">{error}</div>}
          {success && (
            <div className="alert-swiggy-success mb-3">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email with OTP */}
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

            {/* OTP and New Password */}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-orange w-100 mb-4"
              disabled={loading || !otpSent}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Back to Login */}
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
