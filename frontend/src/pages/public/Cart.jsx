import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrashAlt, FaShoppingCart, FaArrowRight, FaStore } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/helpers";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const CartPage = () => {
  useDocumentTitle("Your Cart");
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container-app py-10">
        <div className="h-8 w-40 skeleton rounded-lg" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card flex items-center gap-4 p-4">
                <div className="h-20 w-20 skeleton rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                  <div className="h-4 w-20 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="card h-48 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app py-12 sm:py-16">
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Let's fix that!"
          actionText="Browse restaurants"
          actionTo="/restaurants"
          icon={FaShoppingCart}
        />
      </div>
    );
  }

  const handleQty = async (item, delta) => {
    try {
      if (item.quantity + delta < 1) {
        await removeFromCart(item.id);
        toast.info("Item removed from cart");
      } else {
        await updateQuantity(item.id, item.quantity + delta);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update");
    }
  };

  const goToCheckout = () => {
    if (!isAuthenticated) return toast.info("Please log in to checkout");
    navigate("/checkout");
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <h1 className="section-title">Your Cart</h1>
      <p className="section-subtitle">{cart.count} item{cart.count !== 1 ? "s" : ""}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {cart.items.map(({ id, food, quantity, price }) => (
            <div key={id} className="card flex items-center gap-3 p-4 sm:gap-4">
              <img
                src={food?.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=75&auto=format`}
                alt={food?.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <Link to={`/foods/${food?.id}`} className="text-sm font-semibold text-slate-900 hover:text-orange-600 sm:text-base">
                  {food?.name}
                </Link>
                {food?.restaurant?.name && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <FaStore className="text-[10px]" /> {food.restaurant.name}
                  </p>
                )}
                <p className="mt-1 font-bold text-slate-900">{formatINR(price * quantity)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => handleQty({ id, quantity }, -1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
                    aria-label="Decrease quantity"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="min-w-[20px] text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQty({ id, quantity }, 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500 text-white shadow-sm transition-colors hover:bg-orange-600"
                    aria-label="Increase quantity"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
                <button
                  onClick={async () => {
                    await removeFromCart(id);
                    toast.info("Item removed from cart");
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove item"
                >
                  <FaTrashAlt className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill summary */}
        <div className="card h-fit p-5 sm:p-6">
          <h3 className="font-bold text-slate-900">Bill details</h3>
          <div className="mt-4 space-y-2.5 text-sm">
            <Row label="Item total" value={formatINR(cart.itemsTotal)} />
            <Row label="Delivery fee" value="Calculated at checkout" />
            <Row label="Discount" value="Apply coupons at checkout" accent="text-emerald-600" />
            <div className="divider" />
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>To pay</span>
              <span>{formatINR(cart.itemsTotal)}</span>
            </div>
          </div>
          <button onClick={goToCheckout} className="btn-primary btn-lg mt-5 w-full">
            Proceed to checkout <FaArrowRight className="text-sm" />
          </button>
          <Link
            to="/restaurants"
            className="mt-3 block text-center text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Add more items
          </Link>
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

export default CartPage;
