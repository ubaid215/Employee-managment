import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while auth is initializing
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and correct role (or no role required), render children
  return children;
};

export default ProtectedRoute;