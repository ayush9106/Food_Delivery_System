import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaSearch, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChevronLeft, FaChevronRight, FaStar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate, getErrorMessage } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const STATUSES = ["all", "pending", "approved", "rejected"];

const AdminRestaurants = () => {
  useDocumentTitle("Manage Restaurants");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/admin/restaurants?status=${status}&search=${encodeURIComponent(search)}&page=${page}&limit=10`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, page]);
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { if (search) load(); }, [search]);

  const approve = async (id, nextStatus) => {
    if (!window.confirm(`Set this restaurant to "${nextStatus}"?`)) return;
    try {
      await api.patch(`/admin/restaurants/${id}/approve`, { status: nextStatus });
      toast.success(`Restaurant ${nextStatus}`);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Action failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Restaurants" items={ADMIN_NAV} loading={loading} loaderLabel="Loading restaurants...">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field w-44">
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-52">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or cuisine..." className="input-field pl-9" />
        </div>
      </div>

      {data && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Restaurant</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Cuisine / City</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.results.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-orange-50/40">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={r.image || `https://via.placeholder.com/100?text=Restaurant`} alt={r.name} className="h-10 w-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-slate-900">{r.name}</p>
                            <p className="text-xs text-slate-500">{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-700">{r.owner?.name}</p>
                        <p className="text-xs text-slate-500">{r.owner?.email}</p>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{r.cuisine} · {r.city}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <FaStar className="text-amber-400" /> {Number(r.rating || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => approve(r.id, "approved")} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                                <FaCheckCircle className="mr-1 inline" /> Approve
                              </button>
                              <button onClick={() => approve(r.id, "rejected")} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                                <FaTimesCircle className="mr-1 inline" /> Reject
                              </button>
                            </>
                          )}
                          {r.status === "rejected" && (
                            <button onClick={() => approve(r.id, "approved")} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                              <FaCheckCircle className="mr-1 inline" /> Approve
                            </button>
                          )}
                          {r.status === "approved" && (
                            <button onClick={() => approve(r.id, "pending")} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                              <FaHourglassHalf className="mr-1 inline" /> Move to pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.results.length === 0 && <div className="p-8 text-center text-slate-500">No restaurants found.</div>}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">{data.total} restaurant{data.total > 1 ? "s" : ""}</p>
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

export default AdminRestaurants;
