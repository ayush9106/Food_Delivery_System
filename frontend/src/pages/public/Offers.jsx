import api from "../../api/client";
import useFetch from "../../hooks/useFetch";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Loader from "../../components/common/Loader";
import SectionHeading from "../../components/ui/SectionHeading";
import EmptyState from "../../components/common/EmptyState";

const OFFER_GRADIENTS = [
  "from-orange-500 to-red-500",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

const Offers = () => {
  useDocumentTitle("Offers & Deals");
  const { data: offers, loading } = useFetch(() => api.get("/offers").then((r) => r.data.data));

  return (
    <div className="container-app py-10">
      <SectionHeading title="Offers & Deals" subtitle="Grab the best discounts before they expire" />

      {loading ? (
        <Loader />
      ) : !offers?.length ? (
        <EmptyState title="No active offers" message="New deals are on the way. Check back soon!" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${OFFER_GRADIENTS[i % OFFER_GRADIENTS.length]} p-7 text-white shadow-card transition-transform hover:-translate-y-1`}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="relative">
                <span className="badge bg-white/20 text-white backdrop-blur">
                  {offer.discountPercent}% OFF
                </span>
                <h3 className="mt-3 text-xl font-extrabold">{offer.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{offer.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {offer.code && (
                    <span className="rounded-lg bg-black/20 px-3 py-1 font-mono text-sm font-bold">
                      {offer.code}
                    </span>
                  )}
                  <span className="text-xs text-white/70">
                    Valid till {new Date(offer.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {Number(offer.minOrderAmount) > 0 && (
                  <p className="mt-3 text-xs text-white/70">Min. order ₹{Number(offer.minOrderAmount)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
