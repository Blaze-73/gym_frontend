import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/common/Loading';

const ProtectedRoute = ({ requireAdmin = false, requireNonAdmin = false, children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Store the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the route REQUIRES Admin, but the user is NOT an admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/forbidden" replace />;
  }

  // If the route REQUIRES a Client, but the user IS an admin
  if (requireNonAdmin && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  // Passes all checks -> Render the layout or the nested route
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
