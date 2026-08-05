import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaUsers as FaUserGroup, FaStore as FaRestaurant, FaMotorcycle as FaBike,
  FaDownload, FaStar,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import { formatINR, formatDate } from "../../utils/helpers";
import { ADMIN_NAV } from "./AdminDashboard";

const TABS = [
  { key: "customers", label: "Customers", Icon: FaUserGroup },
  { key: "restaurants", label: "Restaurants", Icon: FaRestaurant },
  { key: "delivery", label: "Delivery partners", Icon: FaBike },
];

const AdminReports = () => {
  useDocumentTitle("Reports");
  const [tab, setTab] = useState("customers");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = (type) => {
    setLoading(true);
    api
      .get(`/admin/reports?type=${type}`)
      .then((r) => setData(r.data.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(tab); }, [tab]);

  const exportCsv = () => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const v = row[h];
        if (v === null || v === undefined) return "";
        if (h === "createdAt" || h === "validFrom" || h === "validTo" || h === "deliveredAt") return formatDate(v, true);
        if (h === "name" && typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
        return v;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Reports" items={ADMIN_NAV} loading={loading} loaderLabel="Generating report...">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                tab === key ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
              }`}
            >
              <Icon className="text-xs" /> {label}
            </button>
          ))}
        </div>
        <button onClick={exportCsv} disabled={!data?.length} className="btn-primary ml-auto px-4 py-2 text-sm disabled:opacity-50">
          <FaDownload className="text-xs" /> Export CSV
        </button>
      </div>

      {!data?.length ? (
        <EmptyState title="No data in this report" message="Records will appear here as the platform grows." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  {tab === "customers" && (
                    <>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Joined</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Total spend</th>
                    </>
                  )}
                  {tab === "restaurants" && (
                    <>
                      <th className="px-6 py-3">Restaurant</th>
                      <th className="px-6 py-3">Cuisine</th>
                      <th className="px-6 py-3">City</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Revenue</th>
                    </>
                  )}
                  {tab === "delivery" && (
                    <>
                      <th className="px-6 py-3">Partner</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Vehicle</th>
                      <th className="px-6 py-3">Availability</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Deliveries</th>
                      <th className="px-6 py-3">Earnings</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tab === "customers" &&
                  data.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-orange-50/40">
                      <td className="px-6 py-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-6 py-3 text-slate-600">{u.email}</td>
                      <td className="px-6 py-3 text-slate-600">{u.phone || "—"}</td>
                      <td className="px-6 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-3">{Number(u.orderCount || 0)}</td>
                      <td className="px-6 py-3 font-bold text-slate-900">{formatINR(u.totalSpend || 0)}</td>
                    </tr>
                  ))}
                {tab === "restaurants" &&
                  data.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-orange-50/40">
                      <td className="px-6 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-6 py-3 text-slate-600">{r.cuisine}</td>
                      <td className="px-6 py-3 text-slate-600">{r.city}</td>
                      <td className="px-6 py-3 capitalize text-slate-600">{r.status}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <FaStar className="text-amber-400" /> {Number(r.rating || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3">{Number(r.orderCount || 0)}</td>
                      <td className="px-6 py-3 font-bold text-slate-900">{formatINR(r.revenue || 0)}</td>
                    </tr>
                  ))}
                {tab === "delivery" &&
                  data.map((p, idx) => (
                    <tr key={p.id || idx} className="transition-colors hover:bg-orange-50/40">
                      <td className="px-6 py-3 font-semibold text-slate-900">{p.user?.name}</td>
                      <td className="px-6 py-3 text-slate-600">{p.user?.email}<br /><span className="text-xs">{p.user?.phone || "—"}</span></td>
                      <td className="px-6 py-3 text-slate-600">{p.vehicleType} {p.vehicleNumber && <span className="text-xs">· {p.vehicleNumber}</span>}</td>
                      <td className="px-6 py-3 capitalize text-slate-600">{p.availability}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <FaStar className="text-amber-400" /> {Number(p.rating || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3">{p.totalDeliveries || 0}</td>
                      <td className="px-6 py-3 font-bold text-slate-900">{formatINR(p.earnings || 0)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminReports;
