/**
 * StatCard — KPI card for dashboards.
 * icon: React element, label, value, accent color key.
 */
const ACCENTS = {
  orange: "from-orange-500 to-red-500",
  emerald: "from-emerald-500 to-teal-500",
  blue: "from-blue-500 to-indigo-500",
  violet: "from-violet-500 to-purple-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-pink-500",
};

const StatCard = ({ label, value, icon, accent = "orange", sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
      <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${ACCENTS[accent]} text-white shadow-soft`}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
