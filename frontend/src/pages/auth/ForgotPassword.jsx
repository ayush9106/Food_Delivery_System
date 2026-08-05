import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import { getErrorMessage } from "../../utils/helpers";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ForgotPassword = () => {
  useDocumentTitle("Forgot Password");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          {sent ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                <FaCheckCircle />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Check your inbox</h1>
              <p className="mt-2 text-sm text-slate-500">
                If an account exists for <span className="font-semibold">{email}</span>, we've sent a
                password reset link. It expires in 15 minutes.
              </p>
              <Link to="/login" className="btn-primary mt-6">Back to login</Link>
            </>
          ) : (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
                <FaEnvelope />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Forgot your password?</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={submit} className="mt-8 space-y-4 text-left">
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  <FaPaperPlane className="text-sm" /> {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
              <p className="mt-6 text-sm text-slate-500">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
