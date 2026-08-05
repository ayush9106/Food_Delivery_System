import { NavLink, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTachometerAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

/**
 * DashboardLayout — sidebar + content wrapper used by all role dashboards.
 * items: [{ to, label, Icon, end }]
 */
const DashboardLayout = ({ title, items, children, loading, loaderLabel }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-soft"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
    }`;

  return (
    <div className="container-app grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="card h-fit p-4 lg:sticky lg:top-20">
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3">
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

        <nav className="mt-4 space-y-1">
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
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <FaSignOutAlt className="text-sm" /> Logout
        </button>
      </aside>

      {/* Content */}
      <div>
        <h1 className="mb-6 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
        {loading ? <Loader label={loaderLabel || "Loading..."} /> : children}
      </div>
    </div>
  );
};

export default DashboardLayout;
