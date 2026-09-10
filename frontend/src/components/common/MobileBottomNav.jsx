import { NavLink } from "react-router-dom";

const MobileBottomNav = ({ items }) => {
  const visibleItems = items.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {visibleItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-center transition-colors ${
                isActive
                  ? "text-orange-600"
                  : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                    isActive ? "bg-orange-50" : ""
                  }`}
                >
                  <Icon className="text-base" />
                </span>
                <span className="max-w-[60px] truncate text-[10px] font-medium leading-tight">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
