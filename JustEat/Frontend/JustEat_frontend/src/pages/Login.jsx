import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

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
      await login(form);
      const next = searchParams.get("next");
      navigate(next ? `/${next}` : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-3xl font-extrabold text-orange-500 mb-1">
          Just<span className="text-gray-900 dark:text-white">Eat</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Sign in to discover great food near you
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
                required
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all cursor-pointer border-none"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-orange-500 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
