import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch, FaShoppingCart, FaUser, FaHeart, FaBell, FaBars, FaTimes, FaSignOutAlt,
  FaUtensils, FaStore, FaTachometerAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNotifications } from "../../context/NotificationContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/restaurants", label: "Restaurants" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const dashboardPath = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "restaurant_owner") return "/restaurant/dashboard";
  if (role === "delivery_partner") return "/delivery/dashboard";
  return "/dashboard";
};

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { cart } = useCart();
  const { unread } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart?.count || 0;

  const onSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/restaurants?search=${encodeURIComponent(search.trim())}`);
    setMobileOpen(false);
  };

  const isDashboardRoute = ["/dashboard", "/admin", "/restaurant", "/delivery"].some((p) =>
    location.pathname.startsWith(p)
  );

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <nav className="container-app flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-soft">
            <FaUtensils className="text-sm" />
          </span>
          Foodie
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to={dashboardPath(role)} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop search */}
        <form onSubmit={onSearch} className="hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants & food"
              className="input-field pl-9"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link to="/wishlist" className="relative hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block" title="Wishlist">
                <FaHeart />
              </Link>
              <Link to="/notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Notifications">
                <FaBell />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Cart">
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="ml-1 flex items-center gap-2">
                <Link
                  to={dashboardPath(role)}
                  className="hidden items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-100 sm:flex"
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-24 truncate text-sm font-semibold text-slate-700">{user?.name?.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                <FaUser className="text-xs" /> Login
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-app space-y-1 py-3">
            <form onSubmit={onSearch} className="relative pb-2 md:hidden">
              <FaSearch className="pointer-events-none absolute left-3 top-[26px] -translate-y-1/2 text-sm text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants & food"
                className="input-field pl-9"
              />
            </form>
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50"
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink
                  to={dashboardPath(role)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50"
                >
                  <FaTachometerAlt /> Dashboard
                </NavLink>
                {role === "restaurant_owner" && (
                  <NavLink
                    to="/restaurant/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-orange-50"
                  >
                    <FaStore /> My Restaurant
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
