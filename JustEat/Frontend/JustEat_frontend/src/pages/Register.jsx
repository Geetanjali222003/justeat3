import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerService } from "../auth/authService";

const LOCATIONS = ["NOIDA", "DELHI", "GURGAON"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "",
    location: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerService(form);
      navigate(
        form.role === "OWNER" ? "/login?next=owner-dashboard" : "/login",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 w-full max-w-lg">
        <div className="text-3xl font-extrabold text-orange-500 mb-1">
          Just<span className="text-gray-900 dark:text-white">Eat</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Create your account and start ordering
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {/* Role Picker */}
            <div className="flex flex-col gap-2">
              <label className={labelCls}>I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "CUSTOMER",
                    icon: "🛍️",
                    label: "Customer",
                    sub: "Order food",
                  },
                  {
                    value: "OWNER",
                    icon: "🍴",
                    label: "Restaurant Owner",
                    sub: "List & manage",
                  },
                ].map(({ value, icon, label, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      form.role === value
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>First Name</label>
                <input
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Phone Number</label>
              <input
                name="phoneNumber"
                placeholder="10-digit number"
                value={form.phoneNumber}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className={inputCls}
                >
                  <option value="">Select</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
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
                  <option value="">Select</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all cursor-pointer border-none"
              disabled={loading}
            >
              {loading
                ? "Creating account…"
                : form.role === "OWNER"
                  ? "Create Owner Account →"
                  : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-500 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
