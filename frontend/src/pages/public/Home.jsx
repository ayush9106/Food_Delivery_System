import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch, FaTruck, FaShieldAlt, FaUtensils, FaStar, FaArrowRight,
  FaPepperHot, FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee, FaLeaf, FaFish, FaCookieBite,
} from "react-icons/fa";
import api from "../../api/client";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import Loader from "../../components/common/Loader";
import SectionHeading from "../../components/ui/SectionHeading";

const CATEGORY_ICONS = [
  { name: "Biryani", Icon: FaPepperHot, color: "bg-orange-100 text-orange-600" },
  { name: "Pizza", Icon: FaPizzaSlice, color: "bg-amber-100 text-amber-600" },
  { name: "Burger", Icon: FaHamburger, color: "bg-red-100 text-red-500" },
  { name: "Desserts", Icon: FaIceCream, color: "bg-pink-100 text-pink-500" },
  { name: "Beverages", Icon: FaCoffee, color: "bg-emerald-100 text-emerald-600" },
  { name: "Healthy", Icon: FaLeaf, color: "bg-teal-100 text-teal-600" },
  { name: "Sushi", Icon: FaFish, color: "bg-blue-100 text-blue-600" },
  { name: "Noodles", Icon: FaCookieBite, color: "bg-violet-100 text-violet-600" },
];

const Hero = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="container-app relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-in-up">
          <span className="badge bg-white/20 text-white backdrop-blur">
            <FaStar className="text-amber-300" /> 4.8 rated · 500+ restaurants
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Order food you love, <span className="text-amber-300">delivered fast</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-orange-50/90">
            From local favourites to global cuisines — fresh meals from the best kitchens, right at
            your doorstep in minutes.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(query);
            }}
            className="mt-8 flex max-w-xl overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl"
          >
            <FaSearch className="ml-3 mt-2.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants, cuisines or dishes"
              className="flex-1 border-0 bg-transparent px-3 py-2 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-white">
            <div>
              <p className="text-2xl font-extrabold">30 min</p>
              <p className="text-sm text-orange-100">Average delivery</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">500+</p>
              <p className="text-sm text-orange-100">Restaurants</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold">50k+</p>
              <p className="text-sm text-orange-100">Orders delivered</p>
            </div>
          </div>
        </div>

        {/* Hero collage */}
        <div className="relative hidden lg:block">
          <div className="animate-float grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=60"
              alt="Pizza"
              className="h-52 w-full rounded-3xl object-cover shadow-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=60"
              alt="Burger"
              className="mt-8 h-52 w-full rounded-3xl object-cover shadow-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=60"
              alt="Pizza slice"
              className="h-52 w-full rounded-3xl object-cover shadow-2xl"
            />
            <img
              src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=60"
              alt="Pancakes"
              className="mt-8 h-52 w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-2xl">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-lg text-emerald-600">
              <FaTruck />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Delivery in progress</p>
              <p className="text-xs text-slate-500">Your food is 5 mins away</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  useDocumentTitle("Delicious Food Delivered Fast");
  const navigate = useNavigate();

  const { data: restaurantsData, loading: restaurantsLoading } = useFetch(() =>
    api.get("/restaurants?limit=8").then((r) => r.data.data)
  );
  const { data: offersData } = useFetch(() => api.get("/offers").then((r) => r.data.data));
  const { data: categoriesData } = useFetch(() => api.get("/categories").then((r) => r.data.data));

  const categories = categoriesData || [];

  const onSearch = (query) => {
    navigate(query ? `/restaurants?search=${encodeURIComponent(query)}` : "/restaurants");
  };

  return (
    <div>
      <Hero onSearch={onSearch} />

      {/* Categories */}
      <section className="container-app py-12">
        <SectionHeading
          title="What's on your mind?"
          subtitle="Explore top categories loved by foodies"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORY_ICONS.map(({ name, Icon, color }) => (
            <Link
              key={name}
              to={`/restaurants?category=${encodeURIComponent(name)}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className={`grid h-14 w-14 place-items-center rounded-full text-2xl ${color}`}>
                <Icon />
              </span>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-orange-600">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      {offersData && offersData.length > 0 && (
        <section className="container-app py-6">
          <SectionHeading title="Bank on offers" subtitle="Great deals, straight to your table" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offersData.slice(0, 3).map((offer, i) => (
              <div
                key={offer.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-card transition-transform hover:-translate-y-1 ${
                  ["from-orange-500 to-red-500", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600"][i % 3]
                }`}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <h3 className="text-lg font-extrabold">{offer.title}</h3>
                <p className="mt-1 text-sm text-white/85">{offer.description}</p>
                {offer.code && (
                  <span className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold backdrop-blur">
                    {offer.code}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top restaurants */}
      <section className="container-app py-12">
        <SectionHeading
          title="Top restaurants near you"
          subtitle="Hand-picked by our food critics"
          action={
            <Link to="/restaurants" className="btn-secondary text-sm">
              View all <FaArrowRight className="text-xs" />
            </Link>
          }
        />
        {restaurantsLoading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(restaurantsData?.results || []).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container-app py-12">
        <SectionHeading title="How Foodie works" subtitle="Three simple steps to your next meal" />
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              Icon: FaUtensils,
              step: "01",
              title: "Choose a restaurant",
              desc: "Browse hundreds of restaurants and menus near you, and pick what you're craving.",
              color: "from-orange-500 to-red-500",
            },
            {
              Icon: FaSearch,
              step: "02",
              title: "Order & pay",
              desc: "Add dishes to your cart, apply coupons, and pay securely at checkout.",
              color: "from-emerald-500 to-teal-600",
            },
            {
              Icon: FaTruck,
              step: "03",
              title: "Track & enjoy",
              desc: "Follow your order in real time and get it delivered hot to your door.",
              color: "from-blue-500 to-indigo-600",
            },
          ].map(({ Icon, step, title, desc, color }) => (
            <div key={step} className="card card-hover relative overflow-hidden p-6">
              <span className="absolute right-4 top-2 text-5xl font-extrabold text-slate-100">
                {step}
              </span>
              <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${color} text-2xl text-white shadow-soft`}>
                <Icon />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App CTA */}
      <section className="container-app py-12">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 p-10 text-white shadow-card lg:flex-row">
          <div>
            <h2 className="text-3xl font-extrabold">Hungry? You're one tap away.</h2>
            <p className="mt-2 max-w-xl text-orange-50">
              Join thousands of happy customers. Create an account and get 20% off your first order.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="rounded-xl bg-white px-6 py-3 font-bold text-orange-600 shadow-card transition-transform hover:scale-105">
              Sign up free
            </Link>
            <Link to="/restaurants" className="rounded-xl border-2 border-white/60 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10">
              Browse menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
