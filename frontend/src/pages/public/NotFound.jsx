import { Link } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page not found");
  return (
    <div className="container-app flex flex-col items-center justify-center py-24 text-center">
      <span className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-4xl text-white shadow-soft">
        <FaUtensils />
      </span>
      <h1 className="mt-6 text-7xl font-extrabold text-slate-900">404</h1>
      <p className="mt-2 text-xl font-semibold text-slate-700">Oops! This page wandered off.</p>
      <p className="mt-2 max-w-md text-slate-500">
        The page you're looking for doesn't exist or has been moved. Let's get you back to something delicious.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/restaurants" className="btn-secondary">Browse restaurants</Link>
      </div>
    </div>
  );
};

export default NotFound;
