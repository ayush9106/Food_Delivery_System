import { Link } from "react-router-dom";
import { FaUtensils, FaTruck, FaLeaf, FaHeart } from "react-icons/fa";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const VALUES = [
  { Icon: FaUtensils, title: "Great food", desc: "We partner only with restaurants that cook with quality ingredients and authentic recipes." },
  { Icon: FaTruck, title: "Fast delivery", desc: "Our delivery partners hustle to get your meal to you hot, in under 30 minutes on average." },
  { Icon: FaLeaf, title: "Fresh & safe", desc: "Food safety and freshness are non-negotiable. Every order is handled with care." },
  { Icon: FaHeart, title: "Customer love", desc: "Thousands of happy customers rate us 4.8+ stars. Your happiness is our metric." },
];

const About = () => {
  useDocumentTitle("About Us");
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 py-20 text-center text-white">
        <div className="container-app">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Food, delivered with love</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-50">
            Foodie started with a simple idea — good food should never be far away. Today we connect
            thousands of food lovers with the best kitchens in their city.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-app py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Our story</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              What began as a small delivery service between three friends' kitchens is now one of the
              fastest growing food delivery platforms. We believe that ordering food should be effortless,
              transparent and delightful.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              From street-food classics to gourmet platters, we work hard to make sure every bite arrives
              exactly the way the chef intended — and every experience leaves you smiling.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: "500+", l: "Restaurants" },
                { n: "50k+", l: "Orders delivered" },
                { n: "4.8★", l: "Average rating" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-orange-50 p-4 text-center">
                  <p className="text-2xl font-extrabold text-orange-600">{s.n}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=60" alt="Restaurant" className="h-56 w-full rounded-3xl object-cover shadow-card" />
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=60" alt="Chef" className="mt-6 h-56 w-full rounded-3xl object-cover shadow-card" />
            <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=60" alt="Delivery" className="h-56 w-full rounded-3xl object-cover shadow-card" />
            <img src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=60" alt="Food" className="mt-6 h-56 w-full rounded-3xl object-cover shadow-card" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-app pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="card card-hover p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-xl text-white shadow-soft">
                <Icon />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-app pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold">Join the Foodie family</h2>
          <p className="mx-auto mt-2 max-w-xl text-orange-50">Partner with us as a restaurant or delivery partner, or simply start ordering your favourites.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/register" className="rounded-xl bg-white px-6 py-3 font-bold text-orange-600 shadow-card transition-transform hover:scale-105">Create account</Link>
            <Link to="/restaurants" className="rounded-xl border-2 border-white/60 px-6 py-3 font-bold text-white hover:bg-white/10">Explore food</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
