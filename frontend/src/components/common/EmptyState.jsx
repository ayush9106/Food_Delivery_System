import { FaRegSadTear } from "react-icons/fa";
import { Link } from "react-router-dom";

const EmptyState = ({
  title = "Nothing here yet",
  message,
  actionText,
  actionTo,
  onAction,
  icon: Icon = FaRegSadTear,
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-16 text-center animate-fade-in">
    <span className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-3xl text-orange-300">
      <Icon />
    </span>
    <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
    {message && (
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
    )}
    {actionText && (actionTo || onAction) && (
      <>
        {actionTo ? (
          <Link to={actionTo} className="btn-primary mt-4">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary mt-4">
            {actionText}
          </button>
        )}
      </>
    )}
  </div>
);

export default EmptyState;
