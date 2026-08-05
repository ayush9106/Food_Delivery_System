import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/**
 * RatingStars — visual star rating with optional numeric value.
 */
const RatingStars = ({ value = 0, size = "text-sm", showValue = true, className = "" }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<FaStar key={i} className={`${size} text-amber-400`} />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className={`${size} text-amber-400`} />);
    } else {
      stars.push(<FaRegStar key={i} className={`${size} text-slate-300`} />);
    }
  }
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars}
      {showValue && Number(value) > 0 && (
        <span className="ml-1 text-xs font-semibold text-slate-600">{Number(value).toFixed(1)}</span>
      )}
    </span>
  );
};

export default RatingStars;
