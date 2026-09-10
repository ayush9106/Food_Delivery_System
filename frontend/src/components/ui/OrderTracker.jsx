import { FaClipboardList, FaCheckCircle, FaUtensils, FaMotorcycle, FaHome } from "react-icons/fa";

const STEPS = [
  { key: "placed", label: "Placed", Icon: FaClipboardList },
  { key: "accepted", label: "Confirmed", Icon: FaCheckCircle },
  { key: "preparing", label: "Preparing", Icon: FaUtensils },
  { key: "out_for_delivery", label: "On the way", Icon: FaMotorcycle },
  { key: "delivered", label: "Delivered", Icon: FaHome },
];

const orderIndex = { placed: 0, accepted: 1, preparing: 2, out_for_delivery: 3, delivered: 4 };

const OrderTracker = ({ status }) => {
  if (["rejected", "cancelled"].includes(status)) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
        This order was {status}.
      </div>
    );
  }
  const idx = orderIndex[status] ?? 0;

  return (
    <div className="flex items-start">
      {STEPS.map(({ key, label, Icon }, i) => {
        const done = idx > i;
        const active = idx === i;
        return (
          <div key={key} className="flex flex-1 flex-col items-center">
            <div className="flex items-center w-full">
              {i > 0 && (
                <div className={`h-0.5 flex-1 transition-colors duration-300 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
              )}
              <span
                className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xs transition-all duration-300 ${
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                    ? "border-orange-500 bg-orange-50 text-orange-600 ring-4 ring-orange-100"
                    : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                <Icon />
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors duration-300 ${idx > i + 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
              )}
            </div>
            <span className={`mt-1.5 text-center text-[10px] font-semibold leading-tight sm:text-xs ${done || active ? "text-slate-700" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTracker;
