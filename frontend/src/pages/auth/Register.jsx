import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaUtensils, FaEye, FaEyeSlash,
  FaStore, FaMotorcycle, FaUserTie,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/helpers";
import { roleHome } from "../../config/navigation";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ROLES = [
  { value: "customer", label: "Customer", Icon: FaUserTie, desc: "Order food from anywhere" },
  { value: "restaurant_owner", label: "Restaurant Owner", Icon: FaStore, desc: "List & manage your restaurant" },
  { value: "delivery_partner", label: "Delivery Partner", Icon: FaMotorcycle, desc: "Deliver orders & earn" },
];

const Register = () => {
  useDocumentTitle("Create Account");
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "customer" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success("Account created! Welcome to Foodie");
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
              <FaUtensils />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Join Foodie</h1>
            <p className="mt-1 text-sm text-slate-500">Create your free account in minutes</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Role selection */}
            <div className="grid gap-3 sm:grid-cols-3">
              {ROLES.map(({ value, label, Icon, desc }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setForm({ ...form, role: value })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all ${
                    form.role === value ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-orange-200"
                  }`}
                >
                  <Icon className={`text-xl ${form.role === value ? "text-orange-500" : "text-slate-400"}`} />
                  <span className="text-xs font-bold text-slate-800">{label}</span>
                  <span className="text-[10px] leading-tight text-slate-500">{desc}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-9" placeholder="John Doe" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-9" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-9" placeholder="9876543210" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-9 pr-10" placeholder="Min 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-orange-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
