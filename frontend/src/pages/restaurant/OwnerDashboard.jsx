import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaPlus, FaStar, FaClock, FaRoute, FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { OWNER_NAV } from "../../config/navigation";

const OwnerDashboard = () => {
  useDocumentTitle("Owner Dashboard");
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, oRes] = await Promise.all([
          api.get("/restaurants/owner/mine"),
          api.get("/orders/owner/list"),
        ]);
        setRestaurants(rRes.data.data);
        setOrders(oRes.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const delivered = orders.filter((o) => o.orderStatus === "delivered");
  const revenue = delivered.reduce((s, o) => s + Number(o.totalAmount), 0);
  const pending = orders.filter((o) => o.orderStatus === "pending").length;

  return (
    <DashboardLayout title="Owner Dashboard" items={OWNER_NAV} loading={loading} loaderLabel="Loading dashboard...">
      {/* Restaurant status */}
      {restaurants.map((r) => (
        <div key={r.id} className={`card mb-6 flex flex-wrap items-center gap-4 p-5 ${r.status === "approved" ? "" : "border-amber-300 bg-amber-50/50"}`}>
          <img src={r.image || `https://via.placeholder.com/100?text=Restaurant`} alt={r.name} className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-40 flex-1">
            <p className="font-bold text-slate-900">{r.name}</p>
            <p className="text-sm text-slate-500">{r.cuisine} · {r.city}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-slate-600"><FaStar className="text-amber-400" /> {Number(r.rating || 0).toFixed(1)}</span>
            <span className="flex items-center gap-1 text-sm text-slate-600"><FaClock className="text-orange-400" /> {r.deliveryTime || 30}m</span>
            <span className="flex items-center gap-1 text-sm text-slate-600"><FaRoute className="text-blue-400" /> ₹{Number(r.deliveryFee || 0)}</span>
          </div>
          <StatusBadge status={r.status} />
        </div>
      ))}

      {restaurants.length === 0 && (
        <div className="card mb-6 flex items-center gap-4 border-amber-300 bg-amber-50/50 p-5">
          <FaExclamationTriangle className="text-2xl text-amber-500" />
          <div className="flex-1">
            <p className="font-bold text-slate-900">No restaurant yet</p>
            <p className="text-sm text-slate-500">Create your restaurant profile to start accepting orders.</p>
          </div>
          <Link to="/restaurant/manage" className="btn-primary text-sm">
            <FaPlus className="text-xs" /> Add restaurant
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={orders.length} icon={<FaClipboardList />} accent="orange" />
        <StatCard label="Pending approval" value={pending} icon={<FaClock />} accent="amber" />
        <StatCard label="Delivered" value={delivered.length} icon={<FaStar />} accent="emerald" />
        <StatCard label="Revenue" value={formatINR(revenue)} icon={<FaChartBar />} accent="violet" />
      </div>

      {/* Recent orders */}
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Recent orders</h2>
          <Link to="/restaurant/orders" className="text-sm font-medium text-orange-600 hover:underline">Manage orders</Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No orders yet. They'll appear here when customers order from you.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{order.user?.name}</p>
                  <p className="text-xs text-slate-500">
                    {order.orderNumber} · {formatDate(order.createdAt, true)}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900">{formatINR(order.totalAmount)}</p>
                <StatusBadge status={order.orderStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
