import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Redirects unauthorized users to the login page.
 * @returns {boolean} isAuthenticated - Indicates if the user is authenticated.
 */
const useProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return { isAuthenticated, loading };
};

export default useProtectedRoute;