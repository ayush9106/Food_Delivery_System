import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaMapMarkerAlt, FaTag, FaTruck, FaStar, FaLeaf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import OrderTracker from "../../components/ui/OrderTracker";
import { formatINR, formatDate } from "../../utils/helpers";

const OrderDetails = () => {
  useDocumentTitle("Order Details");
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ foodId: null, rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data.data))
      .catch(() => {
        toast.error("Order not found");
        navigate("/orders");
      });
  }, [id, navigate]);

  if (!order) return <Loader label="Loading order..." />;

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.patch(`/orders/${order.id}/cancel`);
      toast.success("Order cancelled");
      const r = await api.get(`/orders/${order.id}`);
      setOrder(r.data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cannot cancel order");
    }
  };

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        foodId: reviewData.foodId,
        orderId: order.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      toast.success("Review submitted! Thanks for rating.");
      setReviewModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const isDelivered = order.orderStatus === "delivered";
  const cancellable = ["pending", "accepted"].includes(order.orderStatus);

  return (
    <div className="container-app py-10">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600">
        <FaArrowLeft /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{order.restaurant?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.orderNumber} · Placed on {formatDate(order.createdAt, true)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          {cancellable && (
            <button onClick={cancelOrder} className="btn-secondary px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Tracker */}
          <div className="card p-6">
            <h3 className="mb-6 font-bold text-slate-900">Order progress</h3>
            <OrderTracker status={order.orderStatus} />
          </div>

          {/* Items */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Order items</h3>
            <div className="mt-4 space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={item.image || `https://via.placeholder.com/100?text=Food`} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {item.isVeg ? (
                        <span className="text-[10px] text-emerald-600"><FaLeaf /></span>
                      ) : (
                        <span className="text-[10px] text-red-600">•</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Qty {item.quantity} × {formatINR(item.price)}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatINR(item.price * item.quantity)}</p>
                  {isDelivered && (
                    <button
                      onClick={() => setReviewData({ ...reviewData, foodId: item.foodId })}
                      className="grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100"
                      title="Rate this item"
                    >
                      <FaStar />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <FaMapMarkerAlt className="text-orange-500" /> Delivery address
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {order.deliveryAddress?.fullAddress}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Summary + partner */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Bill details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Item total" value={formatINR(order.itemsTotal)} />
              <Row label="Delivery fee" value={formatINR(order.deliveryFee)} />
              <Row label="Tax (5%)" value={formatINR(order.tax)} />
              {Number(order.discount) > 0 && <Row label="Discount" value={`−${formatINR(order.discount)}`} accent="text-emerald-600" />}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>

          {order.deliveryPartner && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <FaTruck className="text-blue-500" /> Delivery partner
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600">
                  {order.deliveryPartner.user?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{order.deliveryPartner.user?.name}</p>
                  <p className="text-xs text-slate-500">{order.deliveryPartner.user?.phone}</p>
                </div>
              </div>
            </div>
          )}

          {order.coupon && (
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <FaTag className="text-emerald-500" /> Coupon
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700">
                  {order.coupon.code}
                </span>{" "}
                saved {formatINR(order.discount)}
              </p>
            </div>
          )}

          <Link to="/restaurants" className="btn-primary w-full">Order more food</Link>
        </div>
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setReviewModal(false)}>
          <div className="animate-fade-in-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Rate this dish</h3>
            <div className="mt-4 flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setReviewData({ ...reviewData, rating: n })} className={n <= reviewData.rating ? "text-amber-400" : "text-slate-200"}>
                  <FaStar />
                </button>
              ))}
            </div>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="How was it?"
              className="input-field mt-4 min-h-24 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReviewModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={submitReview} disabled={submitting} className="btn-primary">
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, accent = "" }) => (
  <div className="flex justify-between text-slate-600">
    <span>{label}</span>
    <span className={`font-semibold text-slate-900 ${accent}`}>{value}</span>
  </div>
);

export default OrderDetails;
