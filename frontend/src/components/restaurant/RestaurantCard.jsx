import { Link } from "react-router-dom";
import { FaStar, FaUtensils, FaClock, FaRoute } from "react-icons/fa";
import RatingStars from "../common/RatingStars";

/**
 * RestaurantCard — card used across listings and home page.
 */
const RestaurantCard = ({ restaurant, className = "" }) => (
  <Link
    to={`/restaurants/${restaurant.id}`}
    className={`card card-hover group overflow-hidden ${className}`}
  >
    <div className="relative h-44 overflow-hidden">
      <img
        src={restaurant.image || `https://via.placeholder.com/400x220?text=${encodeURIComponent(restaurant.name)}`}
        alt={restaurant.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute left-3 top-3 badge bg-white/90 text-orange-700 shadow-sm">
        <FaStar className="text-amber-400" /> {Number(restaurant.rating || 0).toFixed(1)}
      </span>
      {restaurant.discountPercent > 0 && (
        <span className="absolute bottom-3 left-3 badge bg-emerald-500 text-white shadow-sm">
          {restaurant.discountPercent}% OFF
        </span>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-slate-900 transition-colors group-hover:text-orange-600">
          {restaurant.name}
        </h3>
      </div>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
        <FaUtensils className="text-xs text-orange-400" />
        {restaurant.cuisine || "Multi cuisine"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FaClock className="text-orange-400" /> {restaurant.deliveryTime || 30} mins
        </span>
        <span className="flex items-center gap-1">
          <FaRoute className="text-orange-400" /> ₹{Number(restaurant.deliveryFee || 0)}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">{restaurant.city}</span>
      </div>
      <div className="mt-2">
        <RatingStars value={restaurant.rating} showValue={false} />
      </div>
    </div>
  </Link>
);

export default RestaurantCard;
