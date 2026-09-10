const SectionHeading = ({ title, subtitle, action, className = "" }) => (
  <div className={`flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${className}`}>
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {action}
  </div>
);
export default SectionHeading;
