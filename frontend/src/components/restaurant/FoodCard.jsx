import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus, FaHeart, FaRegHeart, FaLeaf } from "react-icons/fa";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/helpers";

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
    <div className="card flex gap-4 p-4 transition-all duration-200 hover:shadow-card-hover">
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900">
              <Link to={`/foods/${food.id}`} className="transition-colors hover:text-orange-600">
                {food.name}
              </Link>
            </h3>
          </div>
          {food.isVeg != null && (
            <span
              className={`mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                food.isVeg
                  ? "border border-emerald-500 text-emerald-600"
                  : "border border-red-500 text-red-600"
              }`}
            >
              {food.isVeg ? <FaLeaf className="text-[8px]" /> : "•"} {food.isVeg ? "VEG" : "NON-VEG"}
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

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
          {food.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="text-sm font-bold text-slate-900 sm:text-base">{formatINR(price)}</span>
          {food.discountPrice && (
            <span className="text-xs text-slate-400 line-through">{formatINR(food.price)}</span>
          )}
          {food.rating > 0 && (
            <span className="badge bg-emerald-50 text-emerald-700">
              ★ {Number(food.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Image + actions */}
      <div className="relative flex shrink-0 flex-col items-end justify-between">
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-150 ${
            wished
              ? "bg-red-50 text-red-500"
              : "bg-slate-50 text-slate-300 hover:text-red-400"
          }`}
          title={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wished ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
        </button>

        {/* Image + add button */}
        <div className="relative h-20 w-20 overflow-hidden rounded-xl sm:h-24 sm:w-24">
          <img
            src={food.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=75&auto=format`}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {currentQty > 0 ? (
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white px-1 py-0.5 shadow-card">
              <button
                onClick={handleRemoveOne}
                className="grid h-6 w-6 place-items-center rounded-md bg-orange-50 text-orange-600 transition-colors hover:bg-orange-100"
                aria-label="Decrease quantity"
              >
                <FaMinus className="text-[9px]" />
              </button>
              <span className="min-w-[16px] text-center text-xs font-bold text-orange-600">
                {currentQty}
              </span>
              <button
                onClick={handleAdd}
                disabled={busy}
                className="grid h-6 w-6 place-items-center rounded-md bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <FaPlus className="text-[9px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={busy}
              className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border-2 border-orange-500 bg-white px-3 py-0.5 text-[11px] font-bold text-orange-600 shadow-sm transition-all hover:bg-orange-500 hover:text-white disabled:opacity-50"
            >
              <FaPlus className="text-[9px]" /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
