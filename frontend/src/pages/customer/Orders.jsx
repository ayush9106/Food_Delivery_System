import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClipboardList, FaHeart, FaKey, FaMapMarkerAlt, FaTachometerAlt, FaUser, FaBell } from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatINR, formatDate } from "../../utils/helpers";

const NAV = [
  { to: "/dashboard", label: "Overview", Icon: FaTachometerAlt, end: true },
  { to: "/orders", label: "My orders", Icon: FaClipboardList },
  { to: "/wishlist", label: "Wishlist", Icon: FaHeart },
  { to: "/profile", label: "Profile", Icon: FaUser },
  { to: "/addresses", label: "Addresses", Icon: FaMapMarkerAlt },
  { to: "/change-password", label: "Change password", Icon: FaKey },
  { to: "/notifications", label: "Notifications", Icon: FaBell },
];

const Orders = () => {
  useDocumentTitle("My Orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then((r) => setOrders(r.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Orders" items={NAV} loading={loading} loaderLabel="Loading orders...">
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Your order history will appear here once you place your first order."
          actionText="Order food now"
          actionTo="/restaurants"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card card-hover flex flex-wrap items-center gap-4 p-5">
              <img
                src={order.restaurant?.image || `https://via.placeholder.com/100?text=Food`}
                alt={order.restaurant?.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="min-w-40 flex-1">
                <p className="font-bold text-slate-900">{order.restaurant?.name}</p>
                <p className="text-xs text-slate-500">
                  {order.orderNumber} · {formatDate(order.createdAt, true)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                  {order.paymentStatus === "paid" ? " · Paid" : " · Pay on delivery"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-extrabold text-slate-900">{formatINR(order.totalAmount)}</p>
                </div>
                <StatusBadge status={order.orderStatus} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Orders;
