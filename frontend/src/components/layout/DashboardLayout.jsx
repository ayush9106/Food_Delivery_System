import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";
import MobileBottomNav from "../common/MobileBottomNav";

const DashboardLayout = ({ title, items, children, loading, loaderLabel }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-soft"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      {/* Mobile top bar */}
      <div className="sticky top-14 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="truncate text-[11px] capitalize text-slate-500">{user?.role?.replace(/_/g, " ")}</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs capitalize text-slate-500">{user?.role?.replace(/_/g, " ")}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="space-y-1 p-3">
              {items.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={linkClass}
                >
                  <Icon className="text-sm" /> {label}
                </NavLink>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3">
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <FaSignOutAlt className="text-sm" /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop layout */}
      <div className="container-app grid gap-6 py-6 lg:grid-cols-[240px_1fr] lg:py-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="card p-4">
              <div className="flex items-center gap-3 rounded-xl bg-orange-50/80 p-3">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs capitalize text-slate-500">{user?.role?.replace(/_/g, " ")}</p>
                </div>
              </div>

              <nav className="mt-3 space-y-0.5">
                {items.map(({ to, label, Icon, end }) => (
                  <NavLink key={to} to={to} end={end} className={linkClass}>
                    <Icon className="text-sm" /> {label}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <FaSignOutAlt className="text-sm" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <h1 className="mb-5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:mb-6 lg:text-3xl">
            {title}
          </h1>
          {loading ? <Loader label={loaderLabel || "Loading..."} /> : children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav items={items} />
    </div>
  );
};

export default DashboardLayout;
