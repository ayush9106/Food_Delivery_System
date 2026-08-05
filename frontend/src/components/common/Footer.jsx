import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaUtensils } from "react-icons/fa";

const Footer = () => (
  <footer className="mt-auto bg-slate-900 text-slate-300">
    <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      {/* Brand */}
      <div>
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <FaUtensils className="text-sm" />
          </span>
          Foodie
        </Link>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Craving something delicious? Order from the best restaurants in your city and get it
          delivered hot and fast.
        </p>
        <div className="mt-5 flex gap-3">
          {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-orange-500 hover:text-white"
            >
              <Icon className="text-sm" />
            </a>
          ))}
        </div>
      </div>

      {/* Company */}
      <div>
        <h4 className="mb-4 font-semibold text-white">Company</h4>
        <ul className="space-y-2 text-sm">
          {[
            { to: "/about", label: "About us" },
            { to: "/contact", label: "Contact" },
            { to: "/offers", label: "Offers" },
            { to: "/register", label: "Become a partner" },
          ].map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="transition-colors hover:text-orange-400">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* For you */}
      <div>
        <h4 className="mb-4 font-semibold text-white">For you</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/restaurants" className="transition-colors hover:text-orange-400">Search restaurants</Link></li>
          <li><Link to="/cart" className="transition-colors hover:text-orange-400">Your cart</Link></li>
          <li><Link to="/wishlist" className="transition-colors hover:text-orange-400">Your wishlist</Link></li>
          <li><Link to="/orders" className="transition-colors hover:text-orange-400">Order history</Link></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="mb-4 font-semibold text-white">Get in touch</h4>
        <ul className="space-y-2 text-sm">
          <li>support@foodie.app</li>
          <li>+91 98765 43210</li>
          <li>Mon – Sun, 9am – 11pm</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-800">
      <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Foodie. All rights reserved.</p>
        <p>Made with ❤️ for food lovers.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
