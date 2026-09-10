import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaSearch, FaBan, FaCheckCircle, FaChevronLeft, FaChevronRight, FaUserShield,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate, getErrorMessage } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const ROLES = ["all", "customer", "restaurant_owner", "delivery_partner", "admin"];

const roleLabel = (r) => (r || "—").replace("_", " ");

const AdminUsers = () => {
  useDocumentTitle("Manage Users");
  const [data, setData] = useState(null);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/admin/users?role=${role}&search=${encodeURIComponent(search)}&page=${page}&limit=10`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [role, page]);
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { if (search) load(); }, [search]);

  const toggleBlock = async (user) => {
    if (user.role?.name === "admin") return;
    if (!window.confirm(`${user.isBlocked ? "Unblock" : "Block"} ${user.name}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/block`);
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e, "Action failed"));
    }
  };

  return (
    <DashboardLayout title="Manage Users" items={ADMIN_NAV} loading={loading} loaderLabel="Loading users...">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-44">
          {ROLES.map((r) => (
            <option key={r} value={r}>{r === "all" ? "All roles" : roleLabel(r)}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-52">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9" />
        </div>
      </div>

      {data && (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.results.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-orange-50/40">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <FaUserShield className="text-xs" /> {roleLabel(user.role?.name)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{user.phone || "—"}</td>
                      <td className="px-6 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={user.isBlocked ? "blocked" : "active"} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        {user.role?.name !== "admin" && (
                          <button
                            onClick={() => toggleBlock(user)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              user.isBlocked ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {user.isBlocked ? <><FaCheckCircle className="mr-1 inline" /> Unblock</> : <><FaBan className="mr-1 inline" /> Block</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.results.length === 0 && <div className="p-8 text-center text-slate-500">No users found.</div>}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">{data.total} user{data.total > 1 ? "s" : ""}</p>
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

export default AdminUsers;
