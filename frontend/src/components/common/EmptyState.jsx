import { FaRegSadTear } from "react-icons/fa";
import { Link } from "react-router-dom";

/**
 * EmptyState — friendly placeholder for empty lists / errors.
 */
const EmptyState = ({ title = "Nothing here yet", message, actionText, actionTo }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
    <span className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-3xl text-orange-400">
      <FaRegSadTear />
    </span>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    {message && <p className="max-w-md text-sm text-slate-500">{message}</p>}
    {actionText && actionTo && (
      <Link to={actionTo} className="btn-primary mt-2">
        {actionText}
      </Link>
    )}
  </div>
);

export default EmptyState;
