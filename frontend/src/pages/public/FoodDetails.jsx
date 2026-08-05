import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPlus, FaMinus, FaHeart, FaRegHeart, FaLeaf, FaStore } from "react-icons/fa";
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
  if (!food) return <div className="container-app py-20 text-center text-slate-500">Food item not found.</div>;

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
    <div className="container-app py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-orange-600">Home</Link> /
        <Link to="/restaurants" className="hover:text-orange-600">Restaurants</Link> /
        {food.restaurant && (
          <>
            <Link to={`/restaurants/${food.restaurant.id}`} className="hover:text-orange-600">{food.restaurant.name}</Link> /
          </>
        )}
        <span className="font-medium text-slate-800">{food.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl">
          <img
            src={food.image || `https://via.placeholder.com/600?text=${encodeURIComponent(food.name)}`}
            alt={food.name}
            className="h-full max-h-[460px] w-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {food.isVeg ? (
                  <span className="inline-flex items-center gap-1 rounded border border-emerald-500 px-2 py-0.5 text-xs font-bold text-emerald-600"><FaLeaf /> VEG</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-red-500 px-2 py-0.5 text-xs font-bold text-red-600">NON-VEG</span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{food.name}</h1>
              {food.restaurant && (
                <Link to={`/restaurants/${food.restaurant.id}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline">
                  <FaStore /> {food.restaurant.name} · {food.restaurant.city}
                </Link>
              )}
            </div>
            <button
              onClick={handleWishlist}
              className={`grid h-11 w-11 place-items-center rounded-full text-lg transition-all ${
                wished ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400 hover:text-red-500"
              }`}
            >
              {wished ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <RatingStars value={food.rating} size="text-lg" />
            <span className="text-sm text-slate-500">({food.totalRatings} ratings)</span>
          </div>

          <p className="mt-4 text-slate-600">{food.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-extrabold text-slate-900">{formatINR(price)}</p>
            {food.discountPrice && (
              <>
                <p className="text-lg text-slate-400 line-through">{formatINR(food.price)}</p>
                <span className="badge bg-emerald-50 text-emerald-600">
                  {Math.round(((Number(food.price) - Number(food.discountPrice)) / Number(food.price)) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Quantity / add */}
          <div className="mt-8">
            {qty > 0 ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    if (cartItem.quantity === 1) {
                      await removeFromCart(cartItem.id);
                      toast.info("Removed from cart");
                    } else {
                      await updateQuantity(cartItem.id, cartItem.quantity - 1);
                    }
                  }}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-orange-100 text-orange-600"
                >
                  <FaMinus />
                </button>
                <span className="text-xl font-bold text-slate-900">{qty}</span>
                <button
                  onClick={async () => { await addToCart(food.id, 1); }}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500 text-white"
                >
                  <FaPlus />
                </button>
                <Link to="/checkout" className="btn-primary">
                  Proceed to checkout →
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
                className="btn-primary px-8 py-3 text-base"
              >
                <FaPlus /> Add to cart
              </button>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-slate-900">Ratings & reviews</h3>
            {food.reviews?.length ? (
              <div className="mt-4 space-y-4">
                {food.reviews.map((r) => (
                  <div key={r.id} className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {r.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold">{r.user?.name}</span>
                      <RatingStars value={r.rating} size="text-xs" showValue={false} />
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No reviews yet for this dish.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
