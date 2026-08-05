import { Link } from "react-router-dom";
import { FaHeart, FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import EmptyState from "../../components/common/EmptyState";
import { formatINR } from "../../utils/helpers";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Wishlist = () => {
  useDocumentTitle("My Wishlist");
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <div className="container-app py-20 text-center text-slate-500">Loading wishlist...</div>;

  if (wishlist.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Your wishlist is empty"
          message="Tap the heart on any dish to save it here for later."
          actionText="Explore food"
          actionTo="/restaurants"
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">My Wishlist</h1>
      <p className="mt-1 text-slate-500">{wishlist.length} saved dish{wishlist.length !== 1 ? "es" : ""}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map(({ id, food }) => (
          <div key={id} className="card card-hover flex items-center gap-4 p-4">
            <img
              src={food?.image || `https://via.placeholder.com/100?text=Food`}
              alt={food?.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link to={`/foods/${food?.id}`} className="truncate font-semibold text-slate-900 hover:text-orange-600">
                {food?.name}
              </Link>
              <p className="text-xs text-slate-500">
                {food?.restaurant?.name} · {food?.restaurant?.city}
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {formatINR(food?.discountPrice || food?.price)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await addToCart(food.id, 1);
                  toast.success(`${food.name} added to cart`);
                }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white transition-transform hover:scale-105"
                title="Add to cart"
              >
                <FaShoppingCart className="text-sm" />
              </button>
              <button
                onClick={async () => {
                  await toggleWishlist(food.id);
                  toast.info("Removed from wishlist");
                }}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
                title="Remove"
              >
                <FaTrashAlt className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/restaurants" className="btn-secondary">
          <FaHeart className="text-sm" /> Discover more
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
