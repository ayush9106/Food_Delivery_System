import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaClipboardList, FaRupeeSign, FaHistory,
  FaMotorcycle, FaCoins, FaBoxes,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { formatINR, formatDate } from "../../utils/helpers";
import { DELIVERY_NAV } from "../../config/navigation";

const DeliveryEarnings = () => {
  useDocumentTitle("Earnings");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/delivery/earnings")
      .then((r) => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = (data?.orders || []).reduce((s, o) => s + Number(o.deliveryFee || 0), 0);

  return (
    <DashboardLayout title="Earnings" items={DELIVERY_NAV} loading={loading} loaderLabel="Loading earnings...">
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total earnings" value={formatINR(data.profile.earnings || 0)} icon={<FaCoins />} accent="violet" />
            <StatCard label="Total deliveries" value={data.profile.totalDeliveries || 0} icon={<FaBoxes />} accent="orange" />
            <StatCard label="This list total" value={formatINR(totalEarned)} icon={<FaRupeeSign />} accent="emerald" />
          </div>

          <div className="card mt-6 overflow-hidden">
            <h3 className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">Earning history</h3>
            {data.orders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FaMotorcycle className="mx-auto mb-3 text-4xl text-slate-300" />
                No completed deliveries yet. Deliveries you complete will earn you the delivery fee.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.deliveredAt, true)}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      +{formatINR(order.deliveryFee)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DeliveryEarnings;
