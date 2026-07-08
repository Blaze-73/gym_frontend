import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import NotificationProvider from '@/components/common/NotificationDropdown';
import CartDrawer from '@/components/common/CartDrawer';
import Forbidden from '@/pages/Forbidden';

// Layouts
import PublicLayout   from '@/components/layout/PublicLayout';
import AdminLayout    from '@/components/layout/AdminLayout';
import ClientLayout   from '@/components/layout/ClientLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RequireSubscription from '@/components/auth/RequireSubscription';
import ClientAuthRedirect from '@/components/auth/ClientAuthRedirect';

// Public pages
import Home          from '@/pages/public/Home';
import Login         from '@/pages/auth/Login';
import Register      from '@/pages/auth/Register';
import Store         from '@/pages/public/Store';
import Plans         from '@/pages/public/Plans';
import ProductDetail from '@/pages/public/ProductDetail';

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard';
import AdminProducts   from '@/pages/admin/AdminProducts';
import AdminAddProduct from '@/pages/admin/AdminAddProduct';
import AdminMembers    from '@/pages/admin/AdminMembers';
import AdminSchedule   from '@/pages/admin/AdminSchedule';
import AdminSettings   from '@/pages/admin/AdminSettings';
import AdminOrders     from '@/pages/admin/AdminOrders';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminCoaches from '@/pages/admin/AdminCoaches';
import AdminAttendance from '@/pages/admin/AdminAttendance';

// Client pages
import ClientDashboard from '@/pages/client/ClientDashboard';
import Workout         from '@/pages/client/Workout';
import Nutrition       from '@/pages/client/Nutrition';
import Coaches         from '@/pages/client/Coaches';
import CoachPortal     from '@/pages/client/CoachPortal';
import MyCoach         from '@/pages/client/MyCoach';
import Settings        from '@/pages/client/Settings';
import MySubscription  from '@/pages/client/MySubscription';
import MyOrders        from '@/pages/client/MyOrders';
import ClassSchedule   from '@/pages/client/ClassSchedule';
import AttendancePass  from '@/pages/client/AttendancePass';
import PaymentSuccess  from '@/pages/public/PaymentSuccess';
import PaymentCancel   from '@/pages/public/PaymentCancel';
import PayPalSetup     from '@/pages/public/PayPalSetup';
import GymCheckInLanding from '@/pages/public/GymCheckInLanding';

function AppRoutes() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-fixed" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/forbidden" element={<Forbidden />} />
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? (isAdmin() ? <Navigate to="/admin" replace /> : <ClientAuthRedirect />)
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? (isAdmin() ? <Navigate to="/admin" replace /> : <ClientAuthRedirect />)
              : <Register />
          }
        />
        <Route path="/store"       element={<Store />} />
        <Route path="/store/:id"   element={<ProductDetail />} />
        <Route path="/plans"       element={<Plans />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel"  element={<PaymentCancel />} />
        <Route path="/paypal-setup"    element={<PayPalSetup />} />
        <Route path="/gym-checkin"      element={<GymCheckInLanding />} />
      </Route>

      {/* ── Admin ──────────────────────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <NotificationProvider isAdmin>
              <AdminLayout />
            </NotificationProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/admin"                    element={<AdminDashboard />} />
        <Route path="/admin/members"            element={<AdminMembers />} />
        <Route path="/admin/schedule"           element={<AdminSchedule />} />
        <Route path="/admin/products"           element={<AdminProducts />} />
        <Route path="/admin/products/add"       element={<AdminAddProduct />} />
        <Route path="/admin/products/edit/:id"  element={<AdminAddProduct />} />
        <Route path="/admin/settings"           element={<AdminSettings />} />
        <Route path="/admin/orders"            element={<AdminOrders />} />
        <Route path="/admin/subscriptions"     element={<AdminSubscriptions />} />
        <Route path="/admin/coaches"          element={<AdminCoaches />} />
        <Route path="/admin/attendance"       element={<AdminAttendance />} />
      </Route>

      {/* ── Client ─────────────────────────────────────────────────── */}
        <Route
          element={
            <ProtectedRoute requireNonAdmin>
              <RequireSubscription>
                <NotificationProvider>
                  <ClientLayout />
                </NotificationProvider>
              </RequireSubscription>
            </ProtectedRoute>
          }
        >
        <Route path="/dashboard"         element={<ClientDashboard />} />
        <Route path="/workout"          element={<Workout />} />
        <Route path="/workout/:id"      element={<Workout />} />
        <Route path="/nutrition"        element={<Nutrition />} />
        <Route path="/coaches"          element={<Coaches />} />
        <Route path="/schedule"         element={<ClassSchedule />} />
        <Route path="/coach-portal"     element={<CoachPortal />} />
        <Route path="/my-coach"         element={<MyCoach />} />
        <Route path="/settings"         element={<Settings />} />
        <Route path="/subscription"     element={<MySubscription />} />
        <Route path="/my-orders"        element={<MyOrders />} />
        <Route path="/attendance-pass"  element={<AttendancePass />} />
      </Route>

      {/* ── Redirects ──────────────────────────────────────────────── */}
      <Route path="/profile"    element={<Navigate to="/dashboard" replace />} />
      <Route path="/attendance" element={<Navigate to="/attendance-pass" replace />} />
      <Route path="/orders"     element={<Navigate to="/my-orders" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartDrawer />
          <ScrollToTop />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; // ✅ THIS IS THE CRITICAL LINE THAT WAS MISSING
