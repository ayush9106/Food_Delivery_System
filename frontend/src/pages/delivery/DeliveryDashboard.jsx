import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt, FaClipboardList, FaRupeeSign, FaHistory,
  FaMotorcycle, FaBoxOpen, FaCheckCircle, FaToggleOn, FaToggleOff, FaRoute,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { formatINR } from "../../utils/helpers";
import { DELIVERY_NAV } from "../../config/navigation";

const DeliveryDashboard = () => {
  useDocumentTitle("Delivery Dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get("/delivery/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggleAvailability = async () => {
    const next = data.profile.availability === "available" ? "busy" : "available";
    try {
      await api.patch("/delivery/availability", { availability: next });
      toast.success(next === "available" ? "You are now available" : "You are now busy");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  return (
    <DashboardLayout title="Delivery Dashboard" items={DELIVERY_NAV} loading={loading} loaderLabel="Loading dashboard...">
      {data && (
        <>
          {/* Availability toggle */}
          <div className={`card mb-6 flex flex-wrap items-center gap-4 p-5 ${data.profile.availability === "available" ? "border-emerald-200 bg-emerald-50/60" : "bg-slate-50"}`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <FaMotorcycle className="text-2xl" />
            </div>
            <div className="min-w-40 flex-1">
              <p className="font-bold text-slate-900">
                {data.profile.availability === "available" ? "You are online" : "You are offline"}
              </p>
              <p className="text-sm text-slate-500">
                {data.profile.vehicleType} · {data.profile.vehicleNumber}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                data.profile.availability === "available"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              {data.profile.availability === "available" ? <FaToggleOff /> : <FaToggleOn />}
              {data.profile.availability === "available" ? "Go offline" : "Go online"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Available orders" value={data.available} icon={<FaBoxOpen />} accent="orange" />
            <StatCard label="Active deliveries" value={data.active} icon={<FaRoute />} accent="blue" />
            <StatCard label="Delivered" value={data.delivered} icon={<FaCheckCircle />} accent="emerald" />
            <StatCard label="Total earnings" value={formatINR(data.earnings)} icon={<FaRupeeSign />} accent="violet" />
          </div>

          {data.available > 0 && (
            <div className="card mt-6 flex flex-wrap items-center gap-4 border-orange-200 bg-orange-50/60 p-5">
              <div className="flex-1">
                <p className="font-bold text-slate-900">{data.available} order{data.available > 1 ? "s" : ""} waiting for pickup</p>
                <p className="text-sm text-slate-500">New orders ready for delivery are available now.</p>
              </div>
              <Link to="/delivery/orders" className="btn-primary text-sm">
                <FaClipboardList className="text-xs" /> View orders
              </Link>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
