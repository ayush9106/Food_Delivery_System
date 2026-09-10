import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaPlus, FaMapMarkerAlt, FaTag, FaWallet, FaCreditCard,
  FaMobileAlt, FaArrowRight, FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/helpers";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const PAY_METHODS = [
  { value: "cash", label: "Cash on delivery", Icon: FaWallet, desc: "Pay when you receive" },
  { value: "card", label: "Card", Icon: FaCreditCard, desc: "Visa, Mastercard, RuPay" },
  { value: "upi", label: "UPI", Icon: FaMobileAlt, desc: "GPay, PhonePe, Paytm" },
];

const Checkout = () => {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    api
      .get("/users/addresses")
      .then((r) => {
        setAddresses(r.data.data);
        const def = r.data.data.find((a) => a.isDefault) || r.data.data[0];
        setSelectedAddress(def || null);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app py-12 sm:py-16">
        <EmptyState
          title="Nothing to checkout"
          message="Your cart is empty. Add some delicious items first!"
          actionText="Browse restaurants"
          actionTo="/restaurants"
        />
      </div>
    );
  }

  const itemsTotal = cart.itemsTotal;
  const restaurant = cart.grouped[0]?.restaurant;
  const deliveryFee = Number(restaurant?.deliveryFee || 0);
  const discount = Number(coupon?.discount || 0);
  const tax = Math.round((itemsTotal - discount) * 0.05);
  const grandTotal = itemsTotal + deliveryFee + tax - discount;

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const { data } = await api.post("/coupons/validate", { code: couponCode, itemsTotal });
      setCoupon(data.data);
      toast.success(`Coupon applied! You saved ${formatINR(data.data.discount)}`);
    } catch (e) {
      setCoupon(null);
      setCouponError(e?.response?.data?.message || "Invalid coupon");
      toast.error(e?.response?.data?.message || "Invalid coupon");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        addressId: selectedAddress.id,
        paymentMethod,
        couponCode: coupon ? coupon.coupon.code : undefined,
      });
      toast.success("Order placed successfully!");
      await fetchCart();
      if (paymentMethod === "cash") {
        navigate(`/orders/${data.data.orderId}`);
      } else {
        navigate(`/payment/${data.data.orderId}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <h1 className="section-title">Checkout</h1>
      <p className="section-subtitle">Almost there! Confirm your details.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Delivery Address */}
          <section className="card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <FaMapMarkerAlt className="text-orange-500" /> Delivery address
            </h3>
            {loadingAddresses ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 skeleton rounded-xl" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm text-slate-500">No saved addresses yet.</p>
                <Link to="/addresses" className="btn-primary mt-3 btn-sm">
                  Add address
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      selectedAddress?.id === a.id
                        ? "border-orange-500 bg-orange-50/60"
                        : "border-slate-100 hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === a.id}
                      onChange={() => setSelectedAddress(a)}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {a.label}
                        {a.isDefault && (
                          <span className="badge ml-2 bg-orange-100 text-orange-700">Default</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        {a.fullAddress}, {a.city}, {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment Method */}
          <section className="card p-5 sm:p-6">
            <h3 className="font-bold text-slate-900">Payment method</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              {PAY_METHODS.map(({ value, label, Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all sm:gap-2 sm:p-4 ${
                    paymentMethod === value
                      ? "border-orange-500 bg-orange-50/60"
                      : "border-slate-100 hover:border-orange-200"
                  }`}
                >
                  <Icon
                    className={`text-lg sm:text-2xl ${
                      paymentMethod === value ? "text-orange-500" : "text-slate-400"
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-800 sm:text-sm">{label}</span>
                  <span className="hidden text-[10px] text-slate-500 sm:inline">{desc}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5 sm:p-6">
            <h3 className="font-bold text-slate-900">Coupon</h3>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="input-field py-2.5 pl-9 uppercase text-sm"
                />
              </div>
              <button onClick={applyCoupon} className="btn-secondary btn-sm shrink-0">
                Apply
              </button>
            </div>
            {couponError && <p className="mt-2 text-xs text-red-500">{couponError}</p>}
            {coupon && (
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <FaCheckCircle /> {coupon.coupon.code} — save {formatINR(coupon.discount)}
              </p>
            )}
          </div>

          {/* Bill */}
          <div className="card p-5 sm:p-6">
            <h3 className="font-bold text-slate-900">Order summary</h3>
            {/* Items preview */}
            <div className="mt-3 space-y-2">
              {cart.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-500">
                  <span className="truncate">{item.food?.name} × {item.quantity}</span>
                  <span className="shrink-0 pl-2 font-medium text-slate-700">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-xs text-slate-400">+ {cart.items.length - 3} more items</p>
              )}
            </div>
            <div className="divider my-3" />
            <div className="space-y-2 text-sm">
              <Row label="Item total" value={formatINR(itemsTotal)} />
              <Row label="Delivery fee" value={formatINR(deliveryFee)} />
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon discount</span>
                  <span className="font-semibold">−{formatINR(discount)}</span>
                </div>
              )}
              <Row label="Tax (5%)" value={formatINR(tax)} />
              <div className="divider" />
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing || !selectedAddress}
              className="btn-primary btn-lg mt-5 w-full"
            >
              {placing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Placing order...
                </span>
              ) : (
                <>
                  Place order · {formatINR(grandTotal)}
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
            <Link
              to="/cart"
              className="mt-3 block text-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              <FaPlus className="mr-1 inline text-xs" /> Edit cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, accent = "" }) => (
  <div className="flex justify-between text-slate-500">
    <span>{label}</span>
    <span className={`font-medium text-slate-700 ${accent}`}>{value}</span>
  </div>
);

export default Checkout;
