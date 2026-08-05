import { FaSpinner } from "react-icons/fa";

/**
 * Loader — full page spinner used during initial loads.
 */
const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <FaSpinner className="animate-spin text-3xl text-orange-500" />
    <p className="text-sm font-medium text-slate-500">{label}</p>
  </div>
);

export default Loader;
