import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

// Login page
// - Handles sign-in form submission
// - Uses `login` from AuthContext and redirects based on role
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      const userRole = res.data?.role || localStorage.getItem("role");
      toast.success("Login successful!");

      // Role-based redirect
      const next = searchParams.get("next");
      if (next) {
        navigate(`/${next}`);
      } else if (userRole === "OWNER") {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
      toast.error(msg);
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
              Sign in to discover great food near you
            </p>
          </div>

          {/* Error Alert */}
          {error && <div className="alert-swiggy-error mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-end mb-4">
              <Link
                to="/forgot-password"
                className="auth-link"
                style={{ fontSize: "13px" }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange w-100 mb-4"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Register Link */}
            <p
              className="text-center mb-0"
              style={{ color: "var(--text-gray)", fontSize: "14px" }}
            >
              New to JustEat?{" "}
              <Link to="/register" className="auth-link">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
