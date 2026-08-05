import { useEffect, useState } from "react";
import {
  FaTachometerAlt, FaUsers, FaStore, FaUtensils, FaListAlt, FaClipboardList,
  FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt,
  FaSearch, FaLeaf, FaChevronLeft, FaChevronRight, FaStar,
} from "react-icons/fa";
import api from "../../api/client";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/common/EmptyState";
import { formatINR } from "../../utils/helpers";
import { ADMIN_NAV } from "./AdminDashboard";

const AdminFoods = () => {
  useDocumentTitle("Food Items");
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/foods?search=${encodeURIComponent(search)}&page=${page}&limit=12`)
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 500);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { if (search) load(); }, [search]);

  return (
    <DashboardLayout title="Food Items" items={ADMIN_NAV} loading={loading} loaderLabel="Loading food items...">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search food items..." className="input-field pl-9" />
        </div>
        <p className="text-sm text-slate-500">{data?.total || 0} items across all restaurants</p>
      </div>

      {data && (
        <>
          {data.results.length === 0 ? (
            <EmptyState title="No food items found" message="Try a different search or check back later." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.results.map((food) => (
                <div key={food.id} className="card card-hover overflow-hidden">
                  <div className="relative h-36">
                    <img src={food.image || `https://via.placeholder.com/300?text=${encodeURIComponent(food.name)}`} alt={food.name} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700">
                      {food.restaurant?.name}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{food.name}</p>
                        <p className="text-xs text-slate-500">{food.category?.name || "Uncategorised"}</p>
                      </div>
                      {food.isVeg && <FaLeaf className="text-emerald-500" />}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        {formatINR(food.discountPrice || food.price)}
                        {food.discountPrice && <span className="ml-1 text-xs text-slate-400 line-through">{formatINR(food.price)}</span>}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <FaStar className="text-amber-400" /> {Number(food.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-slate-500">{data.total} item{data.total > 1 ? "s" : ""}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                  <FaChevronLeft className="text-xs" /> Prev
                </button>
                <span className="px-2 text-sm text-slate-600">Page {data.page} / {data.totalPages}</span>
                <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
                  Next <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminFoods;
