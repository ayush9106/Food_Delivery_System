import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaTimes, FaSort } from "react-icons/fa";
import api from "../../api/client";
import useDebounce from "../../hooks/useDebounce";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import RestaurantCard from "../../components/restaurant/RestaurantCard";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

const CUISINES = ["North Indian", "Italian", "Japanese", "Hyderabadi", "Healthy", "Chinese", "Mexican"];
const CITIES = ["Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Pune"];

const RestaurantList = () => {
  useDocumentTitle("Explore Restaurants");
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [sort, setSort] = useState("rating");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (cuisine) params.set("cuisine", cuisine);
    if (city) params.set("city", city);
    if (sort) params.set("sort", sort);
    params.set("limit", "24");
    setSearchParams(params);

    setLoading(true);
    api
      .get(`/restaurants?${params.toString()}`)
      .then((r) => setData(r.data.data))
      .catch(() => setData({ results: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [debouncedSearch, cuisine, city, sort, setSearchParams]);

  const clearFilters = () => {
    setCuisine("");
    setCity("");
    setSearch("");
    setSort("rating");
  };

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Restaurants</h1>
      <p className="mt-1 text-slate-500">Discover great food in your city</p>

      {/* Search + filters */}
      <div className="mt-6 space-y-4">
        <div className="relative max-w-2xl">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant or cuisine"
            className="input-field py-3 pl-11"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cuisine</span>
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(cuisine === c ? "" : c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                cuisine === c ? "bg-orange-500 text-white shadow-soft" : "bg-white text-slate-600 shadow-card hover:bg-orange-50"
              }`}
            >
              {c}
            </button>
          ))}

          <span className="ml-4 text-xs font-semibold uppercase tracking-wide text-slate-400">City</span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field w-40">
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span className="ml-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <FaSort /> Sort
          </span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-44">
            <option value="rating">Top rated</option>
            <option value="deliveryTime:ASC">Fastest delivery</option>
            <option value="deliveryFee:ASC">Lowest delivery fee</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {data && <span>{data.total} restaurant{data.total !== 1 ? "s" : ""} found</span>}
      </div>

      {loading ? (
        <Loader />
      ) : (data?.results?.length || 0) === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No restaurants found"
            message="Try adjusting your filters or search for something else."
            actionText="Clear filters"
            actionTo="/restaurants"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.results.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
