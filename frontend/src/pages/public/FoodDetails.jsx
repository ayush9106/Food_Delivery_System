import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlus, FaMinus, FaHeart, FaRegHeart, FaLeaf, FaStore, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Loader from "../../components/common/Loader";
import RatingStars from "../../components/common/RatingStars";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { formatINR } from "../../utils/helpers";

const FoodDetails = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, removeFromCart, cart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);

  useDocumentTitle(food ? food.name : "Food");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/foods/${id}`)
      .then((r) => setFood(r.data.data))
      .catch(() => setFood(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading food item..." />;
  if (!food) {
    return (
      <div className="container-app flex flex-col items-center py-20 text-center">
        <p className="text-lg font-semibold text-slate-700">Food item not found</p>
        <Link to="/restaurants" className="btn-primary mt-4">Browse restaurants</Link>
      </div>
    );
  }

  const cartItem = cart?.items?.find((i) => i.foodId === Number(food.id));
  const qty = cartItem?.quantity || 0;
  const wished = isWishlisted(food.id);
  const price = food.discountPrice || food.price;

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.info("Please log in to save items");
    const added = await toggleWishlist(food.id);
    toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
  };

  return (
    <div className="container-app py-6 sm:py-10">
      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-500 sm:mb-6 sm:text-sm">
        <Link to="/" className="hover:text-orange-600">Home</Link> /
        <Link to="/restaurants" className="hover:text-orange-600">Restaurants</Link> /
        {food.restaurant && (
          <>
            <Link to={`/restaurants/${food.restaurant.id}`} className="hover:text-orange-600">{food.restaurant.name}</Link> /
          </>
        )}
        <span className="font-medium text-slate-800">{food.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl lg:rounded-3xl">
          <img
            src={food.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=75&auto=format`}
            alt={food.name}
            className="h-64 w-full object-cover sm:h-80 lg:h-[420px]"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {food.isVeg != null && (
                  <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${
                    food.isVeg ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600"
                  }`}>
                    <FaLeaf className="text-[9px]" /> {food.isVeg ? "VEG" : "NON-VEG"}
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">{food.name}</h1>
              {food.restaurant && (
                <Link to={`/restaurants/${food.restaurant.id}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline">
                  <FaStore className="text-xs" /> {food.restaurant.name} · {food.restaurant.city}
                </Link>
              )}
            </div>
            <button
              onClick={handleWishlist}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all sm:h-11 sm:w-11 ${
                wished ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400 hover:text-red-500"
              }`}
            >
              {wished ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={food.rating} size="text-base" />
            <span className="text-xs text-slate-500">({food.totalRatings} ratings)</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{food.description}</p>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{formatINR(price)}</p>
            {food.discountPrice && (
              <>
                <p className="text-base text-slate-400 line-through">{formatINR(food.price)}</p>
                <span className="badge bg-emerald-50 text-emerald-600">
                  {Math.round(((Number(food.price) - Number(food.discountPrice)) / Number(food.price)) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Quantity / add */}
          <div className="mt-8">
            {qty > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-1">
                  <button
                    onClick={async () => {
                      if (cartItem.quantity === 1) {
                        await removeFromCart(cartItem.id);
                        toast.info("Removed from cart");
                      } else {
                        await updateQuantity(cartItem.id, cartItem.quantity - 1);
                      }
                    }}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-white text-orange-600 shadow-sm"
                  >
                    <FaMinus />
                  </button>
                  <span className="min-w-[24px] text-center text-lg font-bold text-slate-900">{qty}</span>
                  <button
                    onClick={async () => { await addToCart(food.id, 1); }}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-orange-500 text-white shadow-sm"
                  >
                    <FaPlus />
                  </button>
                </div>
                <Link to="/checkout" className="btn-primary">
                  Proceed to checkout
                </Link>
              </div>
            ) : (
              <button
                onClick={async () => {
                  if (!isAuthenticated) return toast.info("Please log in to add items to cart");
                  setBusy(true);
                  try {
                    await addToCart(food.id, 1);
                    toast.success(`${food.name} added to cart`);
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                className="btn-primary btn-lg"
              >
                <FaPlus /> Add to cart
              </button>
            )}
          </div>

          {/* Reviews */}
          {food.reviews?.length > 0 && (
            <div className="mt-10">
              <h3 className="font-bold text-slate-900">Ratings & reviews</h3>
              <div className="mt-3 space-y-3">
                {food.reviews.map((r) => (
                  <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                        {r.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold">{r.user?.name}</span>
                      <RatingStars value={r.rating} size="text-[10px]" showValue={false} />
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
