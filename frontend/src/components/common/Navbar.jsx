import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch, FaShoppingCart, FaUser, FaHeart, FaBell, FaBars, FaTimes,
  FaSignOutAlt, FaUtensils, FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNotifications } from "../../context/NotificationContext";
import { roleHome } from "../../config/navigation";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/restaurants", label: "Restaurants" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { cart } = useCart();
  const { unread } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const cartCount = cart?.count || 0;

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/restaurants?search=${encodeURIComponent(search.trim())}`);
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? "bg-orange-50 text-orange-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl">
      <nav className="container-app flex h-14 items-center justify-between gap-3 sm:h-16">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-soft sm:h-9 sm:w-9">
            <FaUtensils className="text-xs sm:text-sm" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            Foodie
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to={roleHome(role)} className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop search */}
        <form onSubmit={onSearch} className="hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants & food"
              className="input-field py-2 pl-9 text-sm"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {isAuthenticated ? (
            <>
              {/* Wishlist - hidden on mobile */}
              <Link
                to="/wishlist"
                className="relative hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 sm:flex"
                title="Wishlist"
              >
                <FaHeart className="text-[15px]" />
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                title="Notifications"
              >
                <FaBell className="text-[15px]" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                title="Cart"
              >
                <FaShoppingCart className="text-[15px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User avatar/menu - desktop */}
              <div className="relative ml-1 hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-50"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white ring-2 ring-slate-100">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-20 truncate text-sm font-medium text-slate-700">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg animate-scale-in">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Link
                      to={roleHome(role)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Profile
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="text-xs" /> Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Logout button - always visible on desktop */}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 lg:flex"
                title="Sign out"
              >
                <FaSignOutAlt className="text-[15px]" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden text-sm sm:inline-flex">
                Log in
              </Link>
              <Link to="/register" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">
                Sign up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden animate-fade-in">
          <div className="container-app space-y-1 py-3">
            {/* Search */}
            <form onSubmit={onSearch} className="relative pb-3">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants & food"
                className="input-field py-2.5 pl-9"
              />
            </form>

            {/* Links */}
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
              >
                {l.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <NavLink
                  to={roleHome(role)}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  Dashboard
                </NavLink>
                <div className="divider my-2" />
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt /> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                  Log in
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
