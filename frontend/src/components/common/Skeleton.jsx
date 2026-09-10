const Skeleton = ({ className = "", count = 1, inline = false }) => {
  const base = "skeleton";

  if (inline) {
    return <span className={`${base} ${className}`} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} ${className}`} />
      ))}
    </>
  );
};

export const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-44 w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonFoodCard = () => (
  <div className="card flex gap-4 p-4">
    <div className="flex-1 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <div className="flex flex-col items-end justify-between">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-24 w-24 rounded-xl" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton
            key={c}
            className={`h-10 ${c === 0 ? "w-1/4" : "flex-1"}`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  </div>
);

export default Skeleton;
