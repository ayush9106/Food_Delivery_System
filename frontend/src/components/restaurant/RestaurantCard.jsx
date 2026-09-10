import { Link } from "react-router-dom";
import { FaStar, FaUtensils, FaClock, FaRoute } from "react-icons/fa";
import RatingStars from "../common/RatingStars";

const RestaurantCard = ({ restaurant, className = "" }) => (
  <Link
    to={`/restaurants/${restaurant.id}`}
    className={`card card-hover group overflow-hidden ${className}`}
  >
    <div className="relative h-40 overflow-hidden sm:h-44">
      <img
        src={restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=75&auto=format`}
        alt={restaurant.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <span className="absolute left-3 top-3 badge bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
        <FaStar className="text-amber-400" /> {Number(restaurant.rating || 0).toFixed(1)}
      </span>
      {restaurant.discountPercent > 0 && (
        <span className="absolute bottom-3 left-3 badge bg-emerald-500 text-white shadow-sm">
          {restaurant.discountPercent}% OFF
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-900 transition-colors group-hover:text-orange-600">
        {restaurant.name}
      </h3>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
        <FaUtensils className="text-[10px] text-orange-400" />
        {restaurant.cuisine || "Multi cuisine"}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FaClock className="text-orange-400" /> {restaurant.deliveryTime || 30} min
        </span>
        <span className="flex items-center gap-1">
          <FaRoute className="text-orange-400" /> ₹{Number(restaurant.deliveryFee || 0)}
        </span>
        {restaurant.city && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{restaurant.city}</span>
        )}
      </div>
      <div className="mt-2">
        <RatingStars value={restaurant.rating} showValue={false} />
      </div>
    </div>
  </Link>
);

export default RestaurantCard;
