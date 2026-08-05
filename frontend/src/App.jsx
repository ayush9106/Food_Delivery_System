import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Home from "./pages/public/Home";
import RestaurantList from "./pages/public/RestaurantList";
import RestaurantDetails from "./pages/public/RestaurantDetails";
import FoodDetails from "./pages/public/FoodDetails";
import CartPage from "./pages/public/Cart";
import Checkout from "./pages/public/Checkout";
import Payment from "./pages/public/Payment";
import Orders from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import Wishlist from "./pages/customer/Wishlist";
import Offers from "./pages/public/Offers";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import NotFound from "./pages/public/NotFound";
import NotificationsPage from "./pages/customer/Notifications";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Profile from "./pages/customer/Profile";
import Addresses from "./pages/customer/Addresses";
import ChangePassword from "./pages/customer/ChangePassword";

import OwnerDashboard from "./pages/restaurant/OwnerDashboard";
import ManageRestaurant from "./pages/restaurant/ManageRestaurant";
import ManageFoods from "./pages/restaurant/ManageFoods";
import ManageCategories from "./pages/restaurant/ManageCategories";
import OwnerOrders from "./pages/restaurant/OwnerOrders";
import OwnerAnalytics from "./pages/restaurant/OwnerAnalytics";

import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import DeliveryEarnings from "./pages/delivery/DeliveryEarnings";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminFoods from "./pages/admin/AdminFoods";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminReports from "./pages/admin/AdminReports";

import { useAuth } from "./context/AuthContext";

/**
 * Root layout — navbar + footer around every page.
 */
const RootLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const roleHome = (role) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "restaurant_owner") return "/restaurant/dashboard";
  if (role === "delivery_partner") return "/delivery/dashboard";
  return "/dashboard";
};

function App() {
  const { user, role } = useAuth();
  const location = useLocation();

  // Redirect logged-in users away from auth pages.
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );
  if (isAuthPage && user) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<RootLayout><Home /></RootLayout>} />
        <Route path="/restaurants" element={<RootLayout><RestaurantList /></RootLayout>} />
        <Route path="/restaurants/:id" element={<RootLayout><RestaurantDetails /></RootLayout>} />
        <Route path="/foods/:id" element={<RootLayout><FoodDetails /></RootLayout>} />
        <Route path="/cart" element={<RootLayout><CartPage /></RootLayout>} />
        <Route path="/offers" element={<RootLayout><Offers /></RootLayout>} />
        <Route path="/about" element={<RootLayout><About /></RootLayout>} />
        <Route path="/contact" element={<RootLayout><Contact /></RootLayout>} />
        <Route path="*" element={<RootLayout><NotFound /></RootLayout>} />

        {/* Auth */}
        <Route path="/login" element={<RootLayout><Login /></RootLayout>} />
        <Route path="/register" element={<RootLayout><Register /></RootLayout>} />
        <Route path="/forgot-password" element={<RootLayout><ForgotPassword /></RootLayout>} />
        <Route path="/reset-password" element={<RootLayout><ResetPassword /></RootLayout>} />

        {/* Customer */}
        <Route path="/dashboard" element={<ProtectedRoute><RootLayout><CustomerDashboard /></RootLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><RootLayout><Profile /></RootLayout></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><RootLayout><Addresses /></RootLayout></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><RootLayout><ChangePassword /></RootLayout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute roles={["customer"]}><RootLayout><Checkout /></RootLayout></ProtectedRoute>} />
        <Route path="/payment/:orderId" element={<ProtectedRoute roles={["customer"]}><RootLayout><Payment /></RootLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><RootLayout><Orders /></RootLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><RootLayout><OrderDetails /></RootLayout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><RootLayout><Wishlist /></RootLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><RootLayout><NotificationsPage /></RootLayout></ProtectedRoute>} />

        {/* Restaurant owner */}
        <Route path="/restaurant/dashboard" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><OwnerDashboard /></RootLayout></ProtectedRoute>} />
        <Route path="/restaurant/manage" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><ManageRestaurant /></RootLayout></ProtectedRoute>} />
        <Route path="/restaurant/foods" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><ManageFoods /></RootLayout></ProtectedRoute>} />
        <Route path="/restaurant/categories" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><ManageCategories /></RootLayout></ProtectedRoute>} />
        <Route path="/restaurant/orders" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><OwnerOrders /></RootLayout></ProtectedRoute>} />
        <Route path="/restaurant/analytics" element={<ProtectedRoute roles={["restaurant_owner"]}><RootLayout><OwnerAnalytics /></RootLayout></ProtectedRoute>} />

        {/* Delivery partner */}
        <Route path="/delivery/dashboard" element={<ProtectedRoute roles={["delivery_partner"]}><RootLayout><DeliveryDashboard /></RootLayout></ProtectedRoute>} />
        <Route path="/delivery/orders" element={<ProtectedRoute roles={["delivery_partner"]}><RootLayout><DeliveryOrders /></RootLayout></ProtectedRoute>} />
        <Route path="/delivery/earnings" element={<ProtectedRoute roles={["delivery_partner"]}><RootLayout><DeliveryEarnings /></RootLayout></ProtectedRoute>} />
        <Route path="/delivery/history" element={<ProtectedRoute roles={["delivery_partner"]}><RootLayout><DeliveryHistory /></RootLayout></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminDashboard /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminUsers /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/restaurants" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminRestaurants /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/foods" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminFoods /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminCategories /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminOrders /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/delivery" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminDeliveryPartners /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminCoupons /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/offers" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminOffers /></RootLayout></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]}><RootLayout><AdminReports /></RootLayout></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
