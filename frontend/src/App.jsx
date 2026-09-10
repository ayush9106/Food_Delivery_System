import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Loader from "./components/common/Loader";
import { useAuth } from "./context/AuthContext";
import { roleHome } from "./config/navigation";

// Lazy-loaded page components for code splitting
const Home = lazy(() => import("./pages/public/Home"));
const RestaurantList = lazy(() => import("./pages/public/RestaurantList"));
const RestaurantDetails = lazy(() => import("./pages/public/RestaurantDetails"));
const FoodDetails = lazy(() => import("./pages/public/FoodDetails"));
const CartPage = lazy(() => import("./pages/public/Cart"));
const Checkout = lazy(() => import("./pages/public/Checkout"));
const Payment = lazy(() => import("./pages/public/Payment"));
const Offers = lazy(() => import("./pages/public/Offers"));
const About = lazy(() => import("./pages/public/About"));
const Contact = lazy(() => import("./pages/public/Contact"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const Addresses = lazy(() => import("./pages/customer/Addresses"));
const ChangePassword = lazy(() => import("./pages/customer/ChangePassword"));
const Orders = lazy(() => import("./pages/customer/Orders"));
const OrderDetails = lazy(() => import("./pages/customer/OrderDetails"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));
const NotificationsPage = lazy(() => import("./pages/customer/Notifications"));

const OwnerDashboard = lazy(() => import("./pages/restaurant/OwnerDashboard"));
const ManageRestaurant = lazy(() => import("./pages/restaurant/ManageRestaurant"));
const ManageFoods = lazy(() => import("./pages/restaurant/ManageFoods"));
const ManageCategories = lazy(() => import("./pages/restaurant/ManageCategories"));
const OwnerOrders = lazy(() => import("./pages/restaurant/OwnerOrders"));
const OwnerAnalytics = lazy(() => import("./pages/restaurant/OwnerAnalytics"));

const DeliveryDashboard = lazy(() => import("./pages/delivery/DeliveryDashboard"));
const DeliveryOrders = lazy(() => import("./pages/delivery/DeliveryOrders"));
const DeliveryEarnings = lazy(() => import("./pages/delivery/DeliveryEarnings"));
const DeliveryHistory = lazy(() => import("./pages/delivery/DeliveryHistory"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminRestaurants = lazy(() => import("./pages/admin/AdminRestaurants"));
const AdminFoods = lazy(() => import("./pages/admin/AdminFoods"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminDeliveryPartners = lazy(() => import("./pages/admin/AdminDeliveryPartners"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

const RootLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader label="" size="md" />
  </div>
);

function App() {
  const { user, role } = useAuth();
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(
    location.pathname
  );
  if (isAuthPage && user) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </>
  );
}

export default App;
