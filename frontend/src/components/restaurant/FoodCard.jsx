import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus, FaHeart, FaRegHeart, FaLeaf } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/helpers";

/**
 * FoodCard — menu item card with add-to-cart and wishlist actions.
 */
const FoodCard = ({ food, showRestaurant = false }) => {
  const { addToCart, updateQuantity, removeFromCart, cart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);

  const cartItem = cart?.items?.find((i) => i.foodId === Number(food.id));
  const currentQty = cartItem?.quantity || 0;
  const price = food.discountPrice || food.price;
  const wished = isWishlisted(food.id);

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      await addToCart(food.id, 1);
      toast.success(`${food.name} added to cart`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveOne = async () => {
    if (!cartItem) return;
    try {
      if (cartItem.quantity === 1) {
        await removeFromCart(cartItem.id);
        toast.info(`${food.name} removed from cart`);
      } else {
        await updateQuantity(cartItem.id, cartItem.quantity - 1);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update cart");
    }
  };

  const handleWishlist = async () => {
    if (!requireAuth()) return;
    const added = await toggleWishlist(food.id);
    toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
  };

  return (
    <div className="card card-hover group flex gap-4 p-4">
      <div className="flex-1">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-slate-900">
            <Link to={`/foods/${food.id}`} className="hover:text-orange-600">
              {food.name}
            </Link>
          </h3>
          {food.isVeg ? (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-emerald-500 px-1.5 text-[10px] font-bold text-emerald-600">
              <FaLeaf /> VEG
            </span>
          ) : (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-red-500 px-1.5 text-[10px] font-bold text-red-600">
              NON-VEG
            </span>
          )}
        </div>
        {showRestaurant && food.restaurant && (
          <Link
            to={`/restaurants/${food.restaurant.id}`}
            className="mt-0.5 inline-block text-xs font-medium text-orange-600 hover:underline"
          >
            {food.restaurant.name} · {food.restaurant.city}
          </Link>
        )}
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{food.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-slate-900">{formatINR(price)}</span>
          {food.discountPrice && (
            <span className="text-sm text-slate-400 line-through">{formatINR(food.price)}</span>
          )}
          {food.rating > 0 && (
            <span className="badge bg-emerald-50 text-emerald-700">★ {Number(food.rating).toFixed(1)}</span>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-end justify-between">
        <button
          onClick={handleWishlist}
          className={`grid h-8 w-8 place-items-center rounded-full transition-all ${
            wished ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400 hover:text-red-500"
          }`}
          title="Wishlist"
        >
          {wished ? <FaHeart /> : <FaRegHeart />}
        </button>

        <div className="relative h-24 w-24 overflow-hidden rounded-xl">
          <img
            src={food.image || `https://via.placeholder.com/150?text=${encodeURIComponent(food.name)}`}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {currentQty > 0 ? (
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white px-1.5 py-1 shadow-card">
              <button
                onClick={handleRemoveOne}
                className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-600"
                aria-label="Decrease"
              >
                <FaMinus className="text-[9px]" />
              </button>
              <span className="text-xs font-bold text-orange-600">{currentQty}</span>
              <button
                onClick={handleAdd}
                disabled={busy}
                className="grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-white"
                aria-label="Increase"
              >
                <FaPlus className="text-[9px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={busy}
              className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-bold text-emerald-600 shadow-card transition-all hover:bg-emerald-50 disabled:opacity-50"
            >
              <FaPlus /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
