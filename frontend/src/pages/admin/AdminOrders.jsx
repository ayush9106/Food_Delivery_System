import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { ADMIN_NAV } from "./AdminDashboard";

const STATUSES = ["all", "pending", "accepted", "preparing", "out_for_delivery", "delivered", "rejected", "cancelled"];

const AdminOrders = () => {
  useDocumentTitle("Manage Orders");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/admin/orders?status=${status}&page=${page}&limit=10`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, page]);

  return (
    <DashboardLayout title="Manage Orders" items={ADMIN_NAV} loading={loading} loaderLabel="Loading orders...">
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
              status === s ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {data && (
        <>
          {data.results.length === 0 ? (
            <EmptyState title="No orders found" message="Orders matching this status will appear here." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-6 py-3">Order</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Restaurant</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.results.map((o) => (
                      <tr key={o.id} className="transition-colors hover:bg-orange-50/40">
                        <td className="px-6 py-3">
                          <p className="font-semibold text-slate-900">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500">{formatDate(o.createdAt, true)}</p>
                        </td>
                        <td className="px-6 py-3 text-slate-600">{o.user?.name || "—"}</td>
                        <td className="px-6 py-3 text-slate-600">{o.restaurant?.name || "—"}</td>
                        <td className="px-6 py-3">
                          <span className="text-xs text-slate-500">
                            {(o.items || []).reduce((s, i) => s + Number(i.quantity || 0), 0)} items
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-900">{formatINR(o.totalAmount)}</td>
                        <td className="px-6 py-3"><StatusBadge status={o.orderStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">{data.total} order{data.total > 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                  <FaChevronLeft className="text-xs" /> Prev
                </button>
                <span className="px-2 text-sm text-slate-600">Page {data.page} / {data.totalPages}</span>
                <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                  Next <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminOrders;
