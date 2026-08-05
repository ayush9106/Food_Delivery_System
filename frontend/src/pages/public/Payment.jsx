import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaCreditCard, FaMobileAlt, FaWallet } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import { formatINR } from "../../utils/helpers";
import Loader from "../../components/common/Loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ICONS = { card: FaCreditCard, upi: FaMobileAlt, wallet: FaWallet };

/**
 * Payment — mock payment page demonstrating a gateway-ready flow.
 * Replace confirmPayment with a real Stripe/Razorpay checkout later.
 */
const Payment = () => {
  useDocumentTitle("Payment");
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${orderId}`)
      .then((r) => setOrder(r.data.data))
      .catch(() => navigate("/orders"));
  }, [orderId, navigate]);

  if (!order) return <Loader label="Loading payment..." />;

  const MethodIcon = ICONS[order.paymentMethod] || FaWallet;

  const payNow = async () => {
    setProcessing(true);
    // Simulate gateway processing delay.
    await new Promise((r) => setTimeout(r, 1200));
    try {
      await api.post("/payments/initiate", { orderId: order.id, method: order.paymentMethod });
      await api.post("/payments/confirm", { orderId: order.id });
      setDone(true);
      toast.success("Payment successful!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="container-app flex flex-col items-center py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl text-emerald-600">
          <FaCheckCircle />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Payment successful!</h1>
        <p className="mt-2 text-slate-500">Your order {order.orderNumber} has been paid. Get ready to eat!</p>
        <Link to={`/orders/${order.id}`} className="btn-primary mt-6">Track your order</Link>
      </div>
    );
  }

  return (
    <div className="container-app flex justify-center py-16">
      <div className="card w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Secure checkout</h1>
        <p className="mt-1 text-sm text-slate-500">
          Order <span className="font-semibold text-slate-700">{order.orderNumber}</span>
        </p>

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-left text-white shadow-soft">
          <p className="text-sm text-orange-100">Amount to pay</p>
          <p className="mt-1 text-4xl font-extrabold">{formatINR(order.totalAmount)}</p>
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <MethodIcon className="text-2xl" />
            <div>
              <p className="text-sm font-semibold">{order.paymentMethod.toUpperCase()}</p>
              <p className="text-xs text-orange-100">Encrypted · Gateway-ready</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-400">
          This is a demo payment interface. The architecture is ready for Stripe or Razorpay — swap the
          payment service adapter to go live with a real gateway.
        </p>

        <button onClick={payNow} disabled={processing} className="btn-primary mt-6 w-full py-3">
          {processing ? (
            <><FaSpinner className="animate-spin" /> Processing...</>
          ) : (
            `Pay ${formatINR(order.totalAmount)}`
          )}
        </button>
        <Link to="/checkout" className="mt-3 block text-sm font-medium text-slate-500 hover:text-slate-700">
          Back to checkout
        </Link>
      </div>
    </div>
  );
};

export default Payment;
