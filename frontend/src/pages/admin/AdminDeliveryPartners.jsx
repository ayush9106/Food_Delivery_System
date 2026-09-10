import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaStar, FaBoxes, FaCoins, FaUser,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import { formatINR } from "../../utils/helpers";
import { ADMIN_NAV } from "../../config/navigation";

const availabilityBadge = (a) => {
  if (a === "available") return "bg-emerald-50 text-emerald-700";
  if (a === "busy") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
};

const AdminDeliveryPartners = () => {
  useDocumentTitle("Delivery Partners");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/delivery-partners")
      .then((r) => setPartners(r.data.data))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Delivery Partners" items={ADMIN_NAV} loading={loading} loaderLabel="Loading partners...">
      {partners.length === 0 ? (
        <EmptyState title="No delivery partners" message="Delivery partners registered on the platform will show up here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <div key={p.id} className="card card-hover p-5">
              <div className="flex items-center gap-4">
                <img src={p.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || "P")}`} alt={p.user?.name} className="h-12 w-12 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{p.user?.name}</p>
                  <p className="text-xs text-slate-500">{p.user?.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${availabilityBadge(p.availability)}`}>
                  {p.availability}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-900">{p.totalDeliveries || 0}</p>
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-500"><FaBoxes /> Deliveries</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{Number(p.earnings || 0).toLocaleString("en-IN")}</p>
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-500"><FaCoins /> Earnings</p>
                </div>
                <div>
                  <p className="flex items-center justify-center text-lg font-bold text-slate-900"><FaStar className="text-amber-400 text-sm" /> {Number(p.rating || 0).toFixed(1)}</p>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
              </div>

              <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <p><span className="font-semibold text-slate-600">Vehicle:</span> {p.vehicleType} {p.vehicleNumber && `· ${p.vehicleNumber}`}</p>
                <p className="flex items-center gap-1">
                  <span className="font-semibold text-slate-600">Status:</span>
                  {p.user?.isBlocked ? <span className="text-red-500">Blocked</span> : <span className="text-emerald-600">Active</span>}
                </p>
                <p className="flex items-center gap-1"><FaUser className="text-xs" /> Phone: {p.user?.phone || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDeliveryPartners;
