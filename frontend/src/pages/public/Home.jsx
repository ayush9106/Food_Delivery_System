import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch, FaTruck, FaShieldAlt, FaUtensils, FaStar, FaArrowRight,
  FaPepperHot, FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee,
  FaLeaf, FaFish, FaCookieBite, FaClock, FaTag,
} from "react-icons/fa";
import api from "../../api/client";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import Skeleton, { SkeletonCard } from "../../components/common/Skeleton";
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
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl" />

      <div className="container-app relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-in-up">
          <span className="badge bg-white/15 text-white backdrop-blur-sm">
            <FaStar className="text-amber-300" /> Trusted by thousands of food lovers
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Crave it. <br className="hidden sm:block" />
            <span className="text-amber-300">Order it.</span> <br />
            Love it.
          </h1>
          <p className="mt-4 max-w-lg text-base text-orange-50/80 sm:text-lg">
            Discover the best restaurants near you. Fresh food, fast delivery,
            and flavours that make every bite worth it.
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(query);
            }}
            className="mt-8 flex max-w-lg overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl"
          >
            <div className="flex flex-1 items-center">
              <FaSearch className="ml-3 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines or dishes..."
                className="flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0 px-5 sm:px-6">
              <FaSearch className="text-xs" /> Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-6 sm:gap-8">
            {[
              { value: "30 min", label: "Avg. delivery", icon: FaClock },
              { value: "500+", label: "Restaurants", icon: FaUtensils },
              { value: "4.8", label: "App rating", icon: FaStar },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 text-white">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-xs">
                  <Icon />
                </span>
                <div>
                  <p className="text-sm font-bold">{value}</p>
                  <p className="text-[11px] text-orange-100">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero food images - desktop only */}
        <div className="relative hidden lg:block">
          <div className="animate-float grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75"
              alt="Delicious pizza"
              className="h-56 w-full rounded-3xl object-cover shadow-2xl"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75"
              alt="Gourmet burger"
              className="mt-8 h-56 w-full rounded-3xl object-cover shadow-2xl"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=75"
              alt="Fresh pizza slice"
              className="h-56 w-full rounded-3xl object-cover shadow-2xl"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=75"
              alt="Stack of pancakes"
              className="mt-8 h-56 w-full rounded-3xl object-cover shadow-2xl"
              loading="lazy"
            />
          </div>
          {/* Floating delivery card */}
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <FaTruck />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Live tracking</p>
              <p className="text-xs text-slate-500">Follow your order in real-time</p>
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
  const { data: offersData } = useFetch(() =>
    api.get("/offers").then((r) => r.data.data)
  );

  const onSearch = (query) => {
    navigate(query ? `/restaurants?search=${encodeURIComponent(query)}` : "/restaurants");
  };

  return (
    <div className="page-enter">
      <Hero onSearch={onSearch} />

      {/* Categories */}
      <section className="container-app py-10 sm:py-12">
        <SectionHeading
          title="What's on your mind?"
          subtitle="Explore top categories loved by foodies"
        />
        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-4">
          {CATEGORY_ICONS.map(({ name, Icon, color }) => (
            <Link
              key={name}
              to={`/restaurants?category=${encodeURIComponent(name)}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-card-hover sm:gap-3 sm:p-4"
            >
              <span className={`grid h-11 w-11 place-items-center rounded-full text-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 sm:text-2xl ${color}`}>
                <Icon />
              </span>
              <span className="text-[11px] font-semibold text-slate-600 group-hover:text-orange-600 sm:text-xs">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers */}
      {offersData && offersData.length > 0 && (
        <section className="container-app py-6">
          <SectionHeading
            title="Best offers for you"
            subtitle="Great deals, straight to your table"
            action={
              <Link to="/offers" className="btn-ghost text-sm text-orange-600">
                View all <FaArrowRight className="text-xs" />
              </Link>
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offersData.slice(0, 3).map((offer, i) => (
              <div
                key={offer.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 sm:p-6 ${
                  [
                    "from-orange-500 to-red-500",
                    "from-emerald-500 to-teal-600",
                    "from-violet-500 to-purple-600",
                  ][i % 3]
                }`}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <span className="badge bg-white/20 text-xs">
                  <FaTag className="text-[10px]" /> {offer.discountPercent}% OFF
                </span>
                <h3 className="mt-2 text-lg font-extrabold">{offer.title}</h3>
                <p className="mt-1 text-sm text-white/80">{offer.description}</p>
                {offer.code && (
                  <span className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-1 font-mono text-sm font-bold backdrop-blur-sm">
                    {offer.code}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top restaurants */}
      <section className="container-app py-10 sm:py-12">
        <SectionHeading
          title="Top restaurants near you"
          subtitle="Handpicked favourites from your city"
          action={
            <Link to="/restaurants" className="btn-secondary btn-sm">
              View all <FaArrowRight className="text-xs" />
            </Link>
          }
        />
        {restaurantsLoading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(restaurantsData?.results || []).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container-app py-10 sm:py-12">
        <SectionHeading
          title="How Foodie works"
          subtitle="Three simple steps to your next meal"
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            {
              Icon: FaUtensils,
              step: "01",
              title: "Choose a restaurant",
              desc: "Browse hundreds of restaurants and menus near you.",
              color: "from-orange-500 to-red-500",
            },
            {
              Icon: FaSearch,
              step: "02",
              title: "Order & pay",
              desc: "Add dishes to your cart and checkout securely.",
              color: "from-emerald-500 to-teal-600",
            },
            {
              Icon: FaTruck,
              step: "03",
              title: "Track & enjoy",
              desc: "Follow your order in real time until it arrives.",
              color: "from-blue-500 to-indigo-600",
            },
          ].map(({ Icon, step, title, desc, color }) => (
            <div key={step} className="card card-hover relative overflow-hidden p-6">
              <span className="absolute right-4 top-3 text-5xl font-extrabold text-slate-100/80">
                {step}
              </span>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${color} text-xl text-white shadow-soft`}>
                <Icon />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app py-10 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white shadow-card sm:p-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                Hungry? You're one tap away.
              </h2>
              <p className="mt-2 max-w-lg text-sm text-orange-50 sm:text-base">
                Create an account and start ordering from the best restaurants near you.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-card transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                Sign up free
              </Link>
              <Link
                to="/restaurants"
                className="rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
              >
                Browse menu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
