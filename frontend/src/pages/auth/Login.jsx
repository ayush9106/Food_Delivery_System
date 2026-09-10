import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/helpers";
import { roleHome } from "../../config/navigation";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Login = () => {
  useDocumentTitle("Log in");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      const dest = location.state?.from || roleHome(user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card p-6 sm:p-8">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
              <FaUtensils />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-slate-900 sm:text-2xl">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Log in to continue ordering delicious food</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4 sm:mt-8">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field py-3 pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field py-3 pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
            <p className="text-xs font-bold text-orange-700">Demo Accounts</p>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <p><span className="font-medium">Customer:</span> customer@foodie.com</p>
              <p><span className="font-medium">Owner:</span> owner@foodie.com</p>
              <p><span className="font-medium">Admin:</span> admin@foodie.com</p>
              <p><span className="font-medium">Partner:</span> partner@foodie.com</p>
              <p className="pt-1 font-medium text-slate-700">Password: password123</p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to Foodie?{" "}
            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
