const STYLES = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-blue-50 text-blue-700",
  preparing: "bg-violet-50 text-violet-700",
  out_for_delivery: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  cancelled: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-50 text-emerald-700",
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-600",
  approved: "bg-emerald-50 text-emerald-700",
  available: "bg-emerald-50 text-emerald-700",
  busy: "bg-amber-50 text-amber-700",
  offline: "bg-slate-100 text-slate-600",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  default: "bg-orange-50 text-orange-700",
};

const toLabel = (value) =>
  String(value || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * StatusBadge — coloured badge for order/restaurant/availability statuses.
 */
const StatusBadge = ({ status, className = "" }) => (
  <span className={`badge ${STYLES[status] || STYLES.default} ${className}`}>{toLabel(status)}</span>
);

export default StatusBadge;
