import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaClock, FaRoute, FaMapMarkerAlt, FaPhone, FaLeaf } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Loader from "../../components/common/Loader";
import FoodCard from "../../components/restaurant/FoodCard";
import RatingStars from "../../components/common/RatingStars";
import SectionHeading from "../../components/ui/SectionHeading";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
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

  if (loading) return <Loader label="Loading restaurant..." />;

  if (!restaurant) {
    return <div className="container-app py-20 text-center text-slate-500">Restaurant not found.</div>;
  }

  const categories = ["all", ...new Set(restaurant.foods.map((f) => f.category?.name).filter(Boolean))];
  const foods = restaurant.foods.filter((f) => activeCategory === "all" || f.category?.name === activeCategory);

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await api.post("/reviews", { restaurantId: restaurant.id, rating, comment });
      toast.success("Review submitted! Thanks for the feedback.");
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
    <div>
      {/* Cover */}
      <div className="relative h-64 sm:h-80">
        <img
          src={restaurant.coverImage || restaurant.image || `https://via.placeholder.com/1200x400?text=${encodeURIComponent(restaurant.name)}`}
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container-app absolute bottom-0 left-0 right-0 pb-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-white/85">{restaurant.cuisine} · {restaurant.city}, {restaurant.state}</p>
        </div>
      </div>

      {/* Info bar */}
      <div className="container-app">
        <div className="card -mt-8 relative z-10 grid gap-6 p-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
              <FaStar />
            </span>
            <div>
              <p className="font-bold text-slate-900">{Number(restaurant.rating || 0).toFixed(1)} / 5</p>
              <p className="text-xs text-slate-500">{restaurant.totalRatings} ratings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-lg text-orange-600">
              <FaClock />
            </span>
            <div>
              <p className="font-bold text-slate-900">{restaurant.deliveryTime || 30} mins</p>
              <p className="text-xs text-slate-500">Estimated delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-lg text-blue-600">
              <FaRoute />
            </span>
            <div>
              <p className="font-bold text-slate-900">₹{Number(restaurant.deliveryFee || 0)}</p>
              <p className="text-xs text-slate-500">Delivery fee · Min order ₹{Number(restaurant.minOrderAmount || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-app grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        {/* Menu */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                  activeCategory === cat ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {foods.length === 0 && <p className="text-slate-500">No items in this category.</p>}
            {foods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900">Restaurant info</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-orange-500" /> {restaurant.address}</li>
              <li className="flex items-center gap-2"><FaPhone className="text-orange-500" /> {restaurant.phone || "—"}</li>
              <li className="flex items-center gap-2"><FaLeaf className="text-emerald-500" /> {restaurant.description || "Fresh food, made with love."}</li>
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Ratings & reviews</h3>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                Write review
              </button>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-4xl font-extrabold text-slate-900">{Number(restaurant.rating || 0).toFixed(1)}</p>
              <div>
                <RatingStars value={restaurant.rating} />
                <p className="text-xs text-slate-500">{reviews.length} reviews</p>
              </div>
            </div>
            <div className="mt-4 max-h-80 space-y-4 overflow-y-auto">
              {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet. Be the first!</p>}
              {reviews.map((r) => (
                <div key={r.id} className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    {r.user?.profileImage ? (
                      <img src={r.user.profileImage} className="h-7 w-7 rounded-full object-cover" alt={r.user.name} />
                    ) : (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {r.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-slate-800">{r.user?.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1"><RatingStars value={r.rating} size="text-xs" showValue={false} /></div>
                  {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}>
          <div className="animate-fade-in-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

export default RestaurantDetails;
