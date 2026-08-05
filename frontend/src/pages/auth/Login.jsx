import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUtensils } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/helpers";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Login = () => {
  useDocumentTitle("Login");
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
    <div className="container-app flex justify-center py-14">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
              <FaUtensils />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Log in to continue ordering delicious food</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-orange-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-orange-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-orange-700">Demo accounts</p>
            <p className="mt-1">customer@foodie.com · owner@foodie.com · admin@foodie.com · partner@foodie.com</p>
            <p>Password: password123</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to Foodie?{" "}
            <Link to="/register" className="font-semibold text-orange-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const roleHome = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "restaurant_owner") return "/restaurant/dashboard";
  if (role === "delivery_partner") return "/delivery/dashboard";
  return "/dashboard";
};

export default Login;
