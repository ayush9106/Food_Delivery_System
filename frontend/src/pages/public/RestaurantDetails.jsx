import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaClock, FaRoute, FaMapMarkerAlt, FaPhone, FaLeaf, FaArrowLeft, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Loader from "../../components/common/Loader";
import FoodCard from "../../components/restaurant/FoodCard";
import RatingStars from "../../components/common/RatingStars";
import { SkeletonCard } from "../../components/common/Skeleton";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(restaurant ? restaurant.name : "Restaurant");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/restaurants/${id}`)
      .then((r) => setRestaurant(r.data.data))
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));

    api
      .get(`/reviews/restaurant/${id}`)
      .then((r) => setReviews(r.data.data))
      .catch(() => setReviews([]));
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="h-64 skeleton rounded-none sm:h-80" />
        <div className="container-app -mt-8 relative z-10">
          <div className="card -mt-4 p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-11 w-11 skeleton rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-20 skeleton rounded" />
                    <div className="h-3 w-16 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="py-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container-app flex flex-col items-center py-20 text-center">
        <p className="text-lg font-semibold text-slate-700">Restaurant not found</p>
        <Link to="/restaurants" className="btn-primary mt-4">Browse restaurants</Link>
      </div>
    );
  }

  const categories = ["all", ...new Set(restaurant.foods.map((f) => f.category?.name).filter(Boolean))];
  let foods = restaurant.foods.filter(
    (f) => activeCategory === "all" || f.category?.name === activeCategory
  );
  if (menuSearch) {
    const q = menuSearch.toLowerCase();
    foods = foods.filter(
      (f) => f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q)
    );
  }

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await api.post("/reviews", { restaurantId: restaurant.id, rating, comment });
      toast.success("Review submitted!");
      setReviewModalOpen(false);
      setComment("");
      setRating(5);
      const r = await api.get(`/reviews/restaurant/${id}`);
      setReviews(r.data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Cover */}
      <div className="relative h-56 sm:h-72 lg:h-80">
        <img
          src={restaurant.coverImage || restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=75&auto=format`}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="container-app absolute bottom-0 left-0 right-0 pb-5 sm:pb-6">
          <Link to="/restaurants" className="mb-3 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white">
            <FaArrowLeft /> Restaurants
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
            {restaurant.name}
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {restaurant.cuisine} · {restaurant.city}, {restaurant.state}
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div className="container-app">
        <div className="card -mt-6 relative z-10 grid gap-4 p-4 sm:gap-6 sm:grid-cols-3 sm:p-6">
          <InfoItem icon={FaStar} iconColor="emerald" value={`${Number(restaurant.rating || 0).toFixed(1)} / 5`} label={`${restaurant.totalRatings} ratings`} />
          <InfoItem icon={FaClock} iconColor="orange" value={`${restaurant.deliveryTime || 30} mins`} label="Estimated delivery" />
          <InfoItem icon={FaRoute} iconColor="blue" value={`₹${Number(restaurant.deliveryFee || 0)}`} label={`Min order ₹${Number(restaurant.minOrderAmount || 0)}`} />
        </div>
      </div>

      {/* Body */}
      <div className="container-app grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        {/* Menu */}
        <div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all sm:text-sm ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-soft"
                    : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu search */}
          <div className="relative mt-4 max-w-md">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search this menu..."
              className="input-field py-2 pl-9 text-sm"
            />
          </div>

          {/* Food list */}
          <div className="mt-4 space-y-3">
            {foods.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                {menuSearch ? "No items match your search." : "No items in this category."}
              </p>
            )}
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-slate-900">Restaurant info</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-orange-500" /> {restaurant.address}
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="shrink-0 text-orange-500" /> {restaurant.phone || "—"}
              </li>
              <li className="flex items-start gap-2">
                <FaLeaf className="mt-0.5 shrink-0 text-emerald-500" /> {restaurant.description || "Fresh food, made with love."}
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Reviews</h3>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="btn-secondary btn-sm"
              >
                Write review
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-3xl font-extrabold text-slate-900">{Number(restaurant.rating || 0).toFixed(1)}</p>
              <div>
                <RatingStars value={restaurant.rating} />
                <p className="text-xs text-slate-500">{reviews.length} reviews</p>
              </div>
            </div>
            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {reviews.length === 0 && (
                <p className="text-sm text-slate-400">No reviews yet. Be the first!</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    {r.user?.profileImage ? (
                      <img src={r.user.profileImage} className="h-6 w-6 rounded-full object-cover" alt={r.user.name} />
                    ) : (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                        {r.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-800">{r.user?.name}</span>
                    <span className="ml-auto text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-0.5"><RatingStars value={r.rating} size="text-[10px]" showValue={false} /></div>
                  {r.comment && <p className="mt-0.5 text-xs text-slate-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}>
          <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Rate {restaurant.name}</h3>
            <div className="mt-4 flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className={n <= rating ? "text-amber-400" : "text-slate-200"}>
                  <FaStar />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="input-field mt-4 min-h-24 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReviewModalOpen(false)} className="btn-ghost">Cancel</button>
              <button onClick={submitReview} disabled={submitting} className="btn-primary">
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, iconColor, value, label }) => (
  <div className="flex items-center gap-3">
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-${iconColor}-50 text-${iconColor}-600`}>
      <Icon />
    </span>
    <div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  </div>
);

export default RestaurantDetails;
