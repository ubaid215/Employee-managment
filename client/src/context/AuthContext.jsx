/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService'; // Import your auth service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start with true to check auth status
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const response = await authService.checkAuthStatus();
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
        // Don't set error here as user might not be logged in
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Clear error when it's shown
  const clearError = () => setError(null);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      // Log error but still clear local state
      console.warn('Logout request failed:', err.message);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error sending reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(token, password, passwordConfirm);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error resetting password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updatePassword(currentPassword, password, passwordConfirm);
      setUser(response.data.user);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error updating password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update email
  const updateEmail = async (newEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateEmail(newEmail, password);
      setUser(response.data.user);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error updating email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authService.checkAuthStatus();
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; // Or your loading component
    }
    
    if (!isAuthenticated) {
      // Redirect to login or show unauthorized message
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};