import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaUser, FaRupeeSign, FaBoxOpen, FaUtensils as FaFood, FaClipboardCheck, FaHourglassHalf,
} from "react-icons/fa";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const COLORS = ["#f97316", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#14b8a6"];

const AdminDashboard = () => {
  useDocumentTitle("Admin Dashboard");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then((r) => setStats(r.data.data)).catch(() => {}),
      api.get("/analytics/admin?days=30").then((r) => setAnalytics(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statusPie = (analytics?.statusBreakdown || []).map((s) => ({ name: s.orderStatus, value: Number(s.count) }));

  return (
    <DashboardLayout title="Admin Dashboard" items={ADMIN_NAV} loading={loading} loaderLabel="Loading dashboard...">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.users} icon={<FaUser />} accent="orange" />
          <StatCard label="Restaurants" value={stats.restaurants} icon={<FaStore />} accent="blue" />
          <StatCard label="Food items" value={stats.foods} icon={<FaFood />} accent="emerald" />
          <StatCard label="Total revenue" value={formatINR(stats.revenue)} icon={<FaRupeeSign />} accent="violet" />
          <StatCard label="Orders" value={stats.orders} icon={<FaBoxOpen />} accent="amber" />
          <StatCard label="Delivered" value={stats.deliveredOrders} icon={<FaClipboardCheck />} accent="emerald" />
          <StatCard label="Pending approval" value={stats.pendingRestaurants} icon={<FaHourglassHalf />} accent="orange" />
          <StatCard label="Active partners" value={stats.activeDeliveryPartners} icon={<FaMotorcycle />} accent="blue" />
        </div>
      )}

      {analytics && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Revenue chart */}
          <div className="card p-6 lg:col-span-2">
            <h3 className="mb-4 font-bold text-slate-900">Platform revenue — last 30 days</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={analytics.revenueSeries || []}>
                <defs>
                  <linearGradient id="arev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#arev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-slate-900">Order status mix</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top restaurants */}
      {analytics?.topRestaurants?.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-bold text-slate-900">Top restaurants by revenue</h3>
            <Link to="/admin/restaurants" className="text-sm font-medium text-orange-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics.topRestaurants.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 px-6 py-3">
                <img src={r.image || `https://via.placeholder.com/100?text=Restaurant`} alt={r.name} className="h-10 w-10 rounded-lg object-cover" />
                <p className="flex-1 font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">{r.orderCount} orders</p>
                <p className="font-bold text-slate-900">{formatINR(r.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {analytics?.recentOrders?.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-bold text-slate-900">Recent orders</h3>
            <Link to="/admin/orders" className="text-sm font-medium text-orange-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {analytics.recentOrders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                <p className="text-sm font-semibold text-slate-800">{o.orderNumber}</p>
                <p className="text-xs text-slate-500">{o.user?.name} · {o.restaurant?.name}</p>
                <p className="ml-auto text-xs text-slate-500">{formatDate(o.createdAt, true)}</p>
                <p className="font-bold text-slate-900">{formatINR(o.totalAmount)}</p>
                <StatusBadge status={o.orderStatus} />
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
