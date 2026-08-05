import { FaClipboardList, FaCheckCircle, FaUtensils, FaMotorcycle, FaHome } from "react-icons/fa";

const STEPS = [
  { key: "accepted", label: "Accepted", Icon: FaCheckCircle },
  { key: "preparing", label: "Preparing", Icon: FaUtensils },
  { key: "out_for_delivery", label: "Out for delivery", Icon: FaMotorcycle },
  { key: "delivered", label: "Delivered", Icon: FaHome },
];

const indexOf = (status) => {
  const map = { accepted: 1, preparing: 2, out_for_delivery: 3, delivered: 4 };
  return map[status] || 0;
};

/**
 * OrderTracker — visual stepper for order progress.
 */
const OrderTracker = ({ status }) => {
  if (["rejected", "cancelled"].includes(status)) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
        This order was {status}.
      </div>
    );
  }

  const idx = indexOf(status);

  return (
    <div className="flex items-center">
      {/* Placed (always complete) */}
      <StepNode done Icon={FaClipboardList} label="Placed" />
      {STEPS.map(({ key, label, Icon }, i) => (
        <div key={key} className="flex flex-1 items-center">
          <div className={`h-0.5 flex-1 ${idx > i + 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
          <StepNode done={idx > i + 1} active={idx === i + 1} Icon={Icon} label={label} />
        </div>
      ))}
    </div>
  );
};

const StepNode = ({ done, active, Icon, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <span
      className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-all ${
        done
          ? "border-emerald-500 bg-emerald-500 text-white"
          : active
          ? "border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100"
          : "border-slate-200 bg-white text-slate-300"
      }`}
    >
      <Icon className="text-sm" />
    </span>
    <span className={`whitespace-nowrap text-[10px] font-semibold sm:text-xs ${done || active ? "text-slate-800" : "text-slate-400"}`}>
      {label}
    </span>
  </div>
);

export default OrderTracker;
