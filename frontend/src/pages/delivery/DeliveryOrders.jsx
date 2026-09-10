import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt, FaClipboardList, FaRupeeSign, FaHistory,
  FaMotorcycle, FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { DELIVERY_NAV } from "../../config/navigation";

const DeliveryOrders = () => {
  useDocumentTitle("Available Orders");
  const [tab, setTab] = useState("available");
  const [available, setAvailable] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [avRes, histRes] = await Promise.all([
        api.get("/delivery/available-orders"),
        api.get("/delivery/history"),
      ]);
      setAvailable(avRes.data.data);
      const all = histRes.data.data || [];
      setActive(all.filter((o) => ["preparing", "out_for_delivery"].includes(o.orderStatus)));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    if (!window.confirm("Accept this delivery?")) return;
    try {
      await api.post(`/delivery/${id}/accept`);
      toast.success("Delivery accepted — head to the restaurant!");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not accept delivery");
    }
  };

  const deliver = async (id) => {
    if (!window.confirm("Confirm this order was delivered?")) return;
    try {
      await api.patch(`/delivery/${id}/status`);
      toast.success("Order marked as delivered");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  return (
    <DashboardLayout title="Delivery Orders" items={DELIVERY_NAV} loading={loading} loaderLabel="Loading orders...">
      <div className="mb-6 flex gap-2">
        {[
          { key: "available", label: "Available", count: available.length },
          { key: "active", label: "My active", count: active.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.key ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "available" && (
        available.length === 0 ? (
          <EmptyState title="No orders available" message="New orders ready for pickup will show up here. Check back soon!" />
        ) : (
          <div className="space-y-4">
            {available.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={order.restaurant?.image || `https://via.placeholder.com/100?text=Restaurant`}
                      alt={order.restaurant?.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{order.restaurant?.name}</p>
                      <p className="text-xs text-slate-500">
                        {order.restaurant?.address}, {order.restaurant?.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatINR(order.totalAmount)}</p>
                    <p className="text-xs text-slate-500">Delivery fee {formatINR(order.deliveryFee)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items?.map((item) => (
                    <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">
                    {order.orderNumber} · Order placed {formatDate(order.createdAt, true)}
                  </p>
                  <button onClick={() => accept(order.id)} className="btn-primary px-4 py-2 text-sm">
                    <FaMotorcycle className="text-xs" /> Accept delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "active" && (
        active.length === 0 ? (
          <EmptyState title="No active deliveries" message="Accept an available order to see it here." />
        ) : (
          <div className="card p-5">
            <p className="text-sm text-slate-500">Your active deliveries are shown below. Once delivered you'll earn the delivery fee.</p>
            <div className="mt-4 space-y-4">
              {active.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.restaurant?.name}</p>
                    <p className="text-xs text-slate-500">Pickup: {order.restaurant?.address}, {order.restaurant?.city}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.orderStatus} />
                    {order.orderStatus === "out_for_delivery" && (
                      <button onClick={() => deliver(order.id)} className="btn-primary px-3 py-1.5 text-xs">
                        <FaCheckCircle className="text-xs" /> Mark delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Having trouble with an order? <Link to="/contact" className="text-orange-600 hover:underline">Contact support</Link>
      </p>
    </DashboardLayout>
  );
};

export default DeliveryOrders;
