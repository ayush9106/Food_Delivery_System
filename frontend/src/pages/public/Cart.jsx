import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaTrashAlt, FaShoppingCart, FaArrowRight } from "react-icons/fa";
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

  if (loading) return <div className="container-app py-20 text-center text-slate-500">Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Let's fix that!"
          actionText="Browse restaurants"
          actionTo="/restaurants"
        />
      </div>
    );
  }

  const handleQty = async (item, delta) => {
    try {
      if (item.quantity + delta < 1) {
        await removeFromCart(item.id);
        toast.info("Item removed");
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
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Your Cart</h1>
      <p className="mt-1 text-slate-500">{cart.count} item{cart.count !== 1 ? "s" : ""}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {cart.items.map(({ id, food, quantity, price }) => (
            <div key={id} className="card flex items-center gap-4 p-4">
              <img
                src={food?.image || `https://via.placeholder.com/100?text=Food`}
                alt={food?.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <Link to={`/foods/${food?.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                  {food?.name}
                </Link>
                <p className="text-sm text-slate-500">{food?.restaurant?.name}</p>
                <p className="mt-1 font-bold text-slate-900">{formatINR(price * quantity)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5">
                  <button onClick={() => handleQty({ id, quantity }, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-orange-600 shadow-card">
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold text-slate-800">{quantity}</span>
                  <button onClick={() => handleQty({ id, quantity }, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500 text-white">
                    <FaPlus className="text-xs" />
                  </button>
                </div>
                <button onClick={async () => { await removeFromCart(id); toast.info("Item removed"); }} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="card h-fit p-6">
          <h3 className="font-bold text-slate-900">Bill details</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Item total</span>
              <span className="font-semibold text-slate-900">{formatINR(cart.itemsTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery fee</span>
              <span className="font-semibold text-slate-900">Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span className="font-semibold text-emerald-600">Apply coupons at checkout</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
              <span>To pay</span>
              <span>{formatINR(cart.itemsTotal)}</span>
            </div>
          </div>
          <button onClick={goToCheckout} className="btn-primary mt-5 w-full">
            Proceed to checkout <FaArrowRight className="text-sm" />
          </button>
          <Link to="/restaurants" className="mt-3 block text-center text-sm font-medium text-orange-600 hover:underline">
            Add more items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
