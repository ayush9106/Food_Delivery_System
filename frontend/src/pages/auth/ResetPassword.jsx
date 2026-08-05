import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaLock, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import { getErrorMessage } from "../../utils/helpers";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ResetPassword = () => {
  useDocumentTitle("Reset Password");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      toast.success("Password reset successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {done ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                <FaCheckCircle />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Password updated!</h1>
              <p className="mt-2 text-sm text-slate-500">Redirecting you to login...</p>
            </>
          ) : (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
                <FaLock />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Set a new password</h1>
              <p className="mt-1 text-sm text-slate-500">Choose a strong password you'll remember.</p>
              <form onSubmit={submit} className="mt-8 space-y-4 text-left">
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9"
                    placeholder="New password (min 6 chars)"
                    required
                    minLength={6}
                  />
                </div>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" disabled={loading || !token} className="btn-primary w-full py-3">
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              </form>
              <p className="mt-6 text-sm text-slate-500">
                <Link to="/login" className="font-semibold text-orange-600 hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
