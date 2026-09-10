import {
  FaTachometerAlt, FaUser, FaMapMarkerAlt, FaHeart, FaBell, FaKey,
  FaClipboardList, FaStore, FaUtensils, FaListAlt, FaChartBar,
  FaUsers, FaMotorcycle, FaTicketAlt, FaPercent, FaFileAlt, FaRupeeSign,
  FaHistory,
} from "react-icons/fa";

export const roleHome = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "restaurant_owner") return "/restaurant/dashboard";
  if (role === "delivery_partner") return "/delivery/dashboard";
  return "/dashboard";
};

export const CUSTOMER_NAV = [
  { to: "/dashboard", label: "Overview", Icon: FaTachometerAlt, end: true },
  { to: "/orders", label: "My orders", Icon: FaClipboardList },
  { to: "/wishlist", label: "Wishlist", Icon: FaHeart },
  { to: "/profile", label: "Profile", Icon: FaUser },
  { to: "/addresses", label: "Addresses", Icon: FaMapMarkerAlt },
  { to: "/change-password", label: "Change password", Icon: FaKey },
  { to: "/notifications", label: "Notifications", Icon: FaBell },
];

export const OWNER_NAV = [
  { to: "/restaurant/dashboard", label: "Dashboard", Icon: FaTachometerAlt, end: true },
  { to: "/restaurant/manage", label: "My restaurant", Icon: FaStore },
  { to: "/restaurant/foods", label: "Manage menu", Icon: FaUtensils },
  { to: "/restaurant/categories", label: "Categories", Icon: FaListAlt },
  { to: "/restaurant/orders", label: "Orders", Icon: FaClipboardList },
  { to: "/restaurant/analytics", label: "Analytics", Icon: FaChartBar },
];

export const DELIVERY_NAV = [
  { to: "/delivery/dashboard", label: "Overview", Icon: FaTachometerAlt, end: true },
  { to: "/delivery/orders", label: "Available orders", Icon: FaClipboardList },
  { to: "/delivery/earnings", label: "Earnings", Icon: FaRupeeSign },
  { to: "/delivery/history", label: "Delivery history", Icon: FaHistory },
];

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: FaTachometerAlt, end: true },
  { to: "/admin/users", label: "Users", Icon: FaUsers },
  { to: "/admin/restaurants", label: "Restaurants", Icon: FaStore },
  { to: "/admin/foods", label: "Food items", Icon: FaUtensils },
  { to: "/admin/categories", label: "Categories", Icon: FaListAlt },
  { to: "/admin/orders", label: "Orders", Icon: FaClipboardList },
  { to: "/admin/delivery", label: "Delivery partners", Icon: FaMotorcycle },
  { to: "/admin/coupons", label: "Coupons", Icon: FaTicketAlt },
  { to: "/admin/offers", label: "Offers", Icon: FaPercent },
  { to: "/admin/reports", label: "Reports", Icon: FaFileAlt },
];
