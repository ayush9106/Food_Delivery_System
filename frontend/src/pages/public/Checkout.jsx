import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaPlus, FaMapMarkerAlt, FaTag, FaWallet, FaCreditCard, FaMobileAlt, FaArrowRight } from "react-icons/fa";
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

  useEffect(() => {
    api
      .get("/users/addresses")
      .then((r) => {
        setAddresses(r.data.data);
        const def = r.data.data.find((a) => a.isDefault) || r.data.data[0];
        setSelectedAddress(def || null);
      })
      .catch(() => setAddresses([]));
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState title="Nothing to checkout" message="Your cart is empty." actionText="Browse restaurants" actionTo="/restaurants" />
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
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Checkout</h1>
      <p className="mt-1 text-slate-500">Almost there! Confirm your details.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Address */}
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <FaMapMarkerAlt className="text-orange-500" /> Delivery address
            </h3>
            {addresses.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm text-slate-500">You don't have a saved address yet.</p>
                <Link to="/addresses" className="btn-primary mt-3 text-sm">Add address</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      selectedAddress?.id === a.id ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-orange-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === a.id}
                      onChange={() => setSelectedAddress(a)}
                      className="mt-1 accent-orange-500"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {a.label}
                        {a.isDefault && <span className="badge ml-2 bg-orange-100 text-orange-700">Default</span>}
                      </p>
                      <p className="text-sm text-slate-500">{a.fullAddress}, {a.city}, {a.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Payment method</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PAY_METHODS.map(({ value, label, Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === value ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-orange-200"
                  }`}
                >
                  <Icon className={`text-2xl ${paymentMethod === value ? "text-orange-500" : "text-slate-400"}`} />
                  <span className="text-sm font-semibold text-slate-900">{label}</span>
                  <span className="text-xs text-slate-500">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Coupon</h3>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="input-field pl-9 uppercase"
                />
              </div>
              <button onClick={applyCoupon} className="btn-secondary">Apply</button>
            </div>
            {couponError && <p className="mt-2 text-xs text-red-500">{couponError}</p>}
            {coupon && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                ✓ {coupon.coupon.code} applied — save {formatINR(coupon.discount)}
              </p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Bill details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Item total</span>
                <span className="font-semibold text-slate-900">{formatINR(itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery fee</span>
                <span className="font-semibold text-slate-900">{formatINR(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon discount</span>
                  <span className="font-semibold">−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tax (5%)</span>
                <span className="font-semibold text-slate-900">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                <span>To pay</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={placing || !selectedAddress} className="btn-primary mt-5 w-full">
              {placing ? "Placing order..." : `Place order · ${formatINR(grandTotal)}`} {!placing && <FaArrowRight className="text-sm" />}
            </button>
            <Link to="/cart" className="mt-3 block text-center text-sm font-medium text-orange-600 hover:underline">
              <FaPlus className="mr-1 inline text-xs" /> Edit cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
