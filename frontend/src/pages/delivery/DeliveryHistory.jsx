import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaClipboardList, FaRupeeSign, FaHistory,
  FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";
import { DELIVERY_NAV } from "./DeliveryDashboard";

const DeliveryHistory = () => {
  useDocumentTitle("Delivery History");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/delivery/history")
      .then((r) => setOrders(r.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Delivery History" items={DELIVERY_NAV} loading={loading} loaderLabel="Loading history...">
      {orders.length === 0 ? (
        <EmptyState title="No deliveries yet" message="Orders you accept will show up in your history." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <img
                    src={order.restaurant?.image || `https://via.placeholder.com/100?text=Restaurant`}
                    alt={order.restaurant?.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{order.restaurant?.name}</p>
                    <p className="text-xs text-slate-500">
                      {order.orderNumber} · {formatDate(order.createdAt, true)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    order.orderStatus === "delivered" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {order.orderStatus === "delivered" ? <FaCheckCircle /> : <FaTimesCircle />}
                    <StatusBadge status={order.orderStatus} />
                  </span>
                  <p className="font-bold text-slate-900">{formatINR(order.deliveryFee)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeliveryHistory;
