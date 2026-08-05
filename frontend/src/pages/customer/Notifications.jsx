import { Link } from "react-router-dom";
import {
  FaClipboardList, FaHeart, FaKey, FaMapMarkerAlt, FaTachometerAlt, FaUser, FaBell,
  FaCheckDouble,
} from "react-icons/fa";
import { useNotifications } from "../../context/NotificationContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import { timeAgo } from "../../utils/helpers";

const NAV = [
  { to: "/dashboard", label: "Overview", Icon: FaTachometerAlt, end: true },
  { to: "/orders", label: "My orders", Icon: FaClipboardList },
  { to: "/wishlist", label: "Wishlist", Icon: FaHeart },
  { to: "/profile", label: "Profile", Icon: FaUser },
  { to: "/addresses", label: "Addresses", Icon: FaMapMarkerAlt },
  { to: "/change-password", label: "Change password", Icon: FaKey },
  { to: "/notifications", label: "Notifications", Icon: FaBell },
];

const NotificationsPage = () => {
  useDocumentTitle("Notifications");
  const { notifications, markAsRead, markAllRead } = useNotifications();

  return (
    <DashboardLayout
      title="Notifications"
      items={NAV}
      loading={false}
      loaderLabel="Loading notifications..."
    >
      <div className="mb-4 flex justify-end">
        <button onClick={markAllRead} className="btn-secondary px-3 py-1.5 text-xs">
          <FaCheckDouble className="text-sm" /> Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up. Updates about your orders will show up here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`card w-full p-4 text-left transition-all ${
                n.isRead ? "opacity-60" : "border-orange-200 bg-orange-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {n.message && <p className="mt-1 text-sm text-slate-600">{n.message}</p>}
                </div>
                {!n.isRead && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />}
              </div>
              <p className="mt-2 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
            </button>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/offers" className="text-orange-600 hover:underline">Explore offers</Link> while you wait.
        </p>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
