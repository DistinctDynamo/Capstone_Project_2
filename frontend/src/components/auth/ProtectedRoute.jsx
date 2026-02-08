import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { LoadingPage } from '../common/Loading';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingPage text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect admin users to admin dashboard
  if (user?.user_type === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
