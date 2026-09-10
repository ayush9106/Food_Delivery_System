import { useState, useEffect } from "react";
import {
  FaTachometerAlt, FaStore, FaUtensils, FaListAlt, FaClipboardList, FaChartBar,
  FaCheck, FaTimes, FaFire,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { OWNER_NAV } from "../../config/navigation";

const FILTERS = ["all", "pending", "accepted", "preparing", "out_for_delivery", "delivered", "rejected", "cancelled"];

const OwnerOrders = () => {
  useDocumentTitle("Manage Orders");
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/orders/owner/list");
      setOrders(r.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (id, action, message) => {
    try {
      await api.patch(`/orders/${id}/${action}`);
      toast.success(message);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    }
  };

  const visible = filter === "all" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <DashboardLayout title="Manage Orders" items={OWNER_NAV} loading={loading} loaderLabel="Loading orders...">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : orders.filter((o) => o.orderStatus === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === f ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
              }`}
            >
              {f} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No orders here" message="Orders in this status will appear here." />
      ) : (
        <div className="space-y-4">
          {visible.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    {order.user?.name} · {order.user?.phone} · {formatDate(order.createdAt, true)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-extrabold text-slate-900">{formatINR(order.totalAmount)}</p>
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.items?.map((item) => (
                  <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">
                  Payment: <span className="capitalize">{order.paymentMethod}</span>
                  {" · "}<span className="capitalize">{order.paymentStatus}</span>
                  {" · "}Deliver to: {order.deliveryAddress?.fullAddress}, {order.deliveryAddress?.city}
                </p>
                <div className="flex gap-2">
                  {order.orderStatus === "pending" && (
                    <>
                      <button onClick={() => update(order.id, "accept", "Order accepted")} className="btn-primary px-3 py-1.5 text-xs">
                        <FaCheck className="text-xs" /> Accept
                      </button>
                      <button onClick={() => update(order.id, "reject", "Order rejected")} className="btn-ghost px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">
                        <FaTimes className="text-xs" /> Reject
                      </button>
                    </>
                  )}
                  {order.orderStatus === "accepted" && (
                    <button onClick={() => update(order.id, "preparing", "Marked as preparing")} className="btn-secondary px-3 py-1.5 text-xs">
                      <FaFire className="text-xs" /> Start preparing
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerOrders;
