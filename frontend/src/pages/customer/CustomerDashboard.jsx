import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag, FaUser, FaMapMarkerAlt, FaHeart, FaBell, FaKey, FaClipboardList,
  FaTachometerAlt, FaCheckCircle, FaMotorcycle, FaRupeeSign,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";

const NAV = [
  { to: "/dashboard", label: "Overview", Icon: FaTachometerAlt, end: true },
  { to: "/orders", label: "My orders", Icon: FaClipboardList },
  { to: "/wishlist", label: "Wishlist", Icon: FaHeart },
  { to: "/profile", label: "Profile", Icon: FaUser },
  { to: "/addresses", label: "Addresses", Icon: FaMapMarkerAlt },
  { to: "/change-password", label: "Change password", Icon: FaKey },
  { to: "/notifications", label: "Notifications", Icon: FaBell },
];

const CustomerDashboard = () => {
  useDocumentTitle("My Dashboard");
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then((r) => {
        const orders = r.data.data;
        setRecentOrders(orders.slice(0, 5));
        const delivered = orders.filter((o) => o.orderStatus === "delivered");
        setStats({
          totalOrders: orders.length,
          delivered: delivered.length,
          inProgress: orders.filter((o) => ["pending", "accepted", "preparing", "out_for_delivery"].includes(o.orderStatus)).length,
          spent: delivered.reduce((s, o) => s + Number(o.totalAmount), 0),
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Dashboard" items={NAV} loading={loading} loaderLabel="Loading dashboard...">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total orders" value={stats.totalOrders} icon={<FaShoppingBag />} accent="orange" />
          <StatCard label="Delivered" value={stats.delivered} icon={<FaCheckCircle />} accent="emerald" />
          <StatCard label="In progress" value={stats.inProgress} icon={<FaMotorcycle />} accent="blue" />
          <StatCard label="Total spent" value={formatINR(stats.spent)} icon={<FaRupeeSign />} accent="violet" />
        </div>
      )}

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Recent orders</h2>
          <Link to="/orders" className="text-sm font-medium text-orange-600 hover:underline">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No orders yet. Hungry?</p>
            <Link to="/restaurants" className="btn-primary mt-3 text-sm">Browse restaurants</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-orange-50/50">
                <img
                  src={order.restaurant?.image || `https://via.placeholder.com/100?text=Food`}
                  alt={order.restaurant?.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{order.restaurant?.name}</p>
                  <p className="text-xs text-slate-500">
                    {order.orderNumber} · {formatDate(order.createdAt, true)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatINR(order.totalAmount)}</p>
                  <StatusBadge status={order.orderStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
