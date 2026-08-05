import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaRupeeSign, FaShoppingBag, FaReceipt,
} from "react-icons/fa";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { OWNER_NAV } from "./OwnerDashboard";

const COLORS = ["#f97316", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6"];

const OwnerAnalytics = () => {
  useDocumentTitle("Analytics");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/owner?days=30")
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Analytics" items={OWNER_NAV} loading={loading} loaderLabel="Crunching numbers...">
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Orders (30d)" value={data.totals?.orderCount || 0} icon={<FaShoppingBag />} accent="orange" />
            <StatCard label="Revenue (30d)" value={formatINR(data.totals?.revenue || 0)} icon={<FaRupeeSign />} accent="emerald" />
            <StatCard label="Avg order value" value={formatINR(data.totals?.avgOrder || 0)} icon={<FaReceipt />} accent="violet" />
            <StatCard label="Restaurants" value={data.restaurants?.length || 0} icon={<FaStore />} accent="blue" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Revenue chart */}
            <div className="card p-6">
              <h3 className="mb-4 font-bold text-slate-900">Revenue — last 30 days</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.revenueSeries || []}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top foods */}
            <div className="card p-6">
              <h3 className="mb-4 font-bold text-slate-900">Top selling dishes</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={(data.topFoods || []).map((f) => ({ name: f.name, sold: Number(f.totalSold) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent orders */}
          <div className="card mt-6 overflow-hidden">
            <h3 className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">Recent orders</h3>
            <div className="divide-y divide-slate-100">
              {data.recentOrders?.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                  <p className="text-sm font-semibold text-slate-800">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{formatDate(o.createdAt, true)}</p>
                  <span className="ml-auto font-bold text-slate-900">{formatINR(o.totalAmount)}</span>
                  <StatusBadge status={o.orderStatus} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default OwnerAnalytics;
