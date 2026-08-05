/**
 * Extract a human readable error message from an axios error.
 */
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const msg = error?.response?.data?.message;
  if (msg) return msg;
  if (error?.response?.data?.fields) {
    const first = Object.values(error.response.data.fields)[0];
    if (first) return first;
  }
  if (error?.message) return error.message;
  return fallback;
};

/**
 * Format a number as Indian Rupees.
 */
export const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

/**
 * Format a date string to a readable format.
 */
export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
};

/**
 * Time ago helper (for notifications etc.).
 */
export const timeAgo = (value) => {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

/**
 * Human friendly order status (badge friendly).
 */
export const orderStatusLabel = (status) =>
  String(status || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
