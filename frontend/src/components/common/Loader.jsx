const Loader = ({ label = "Loading...", size = "md" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-500`} />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );
};

export const InlineLoader = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-2 py-8">
    <div className="h-5 w-5 animate-spin rounded-full border-[2px] border-orange-200 border-t-orange-500" />
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export default Loader;
