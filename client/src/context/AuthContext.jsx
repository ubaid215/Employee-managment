/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { authService, employeeService } from '../services/apiServices';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Initialize auth state and fetch profile
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetchProfile();
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch user profile using /me endpoint
  const fetchProfile = async () => {
    try {
      const { data } = await employeeService.getProfile();
      setUser(data.employee);
      setError(null);
      return data.employee;
    } catch (err) {
      handleAuthError(err);
      throw err;
    }
  };

  // Handle authentication errors
  const handleAuthError = (err) => {
    console.error('Auth error:', err);
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Authentication failed';
    setError(errorMessage);
    localStorage.removeItem('token');
    setUser(null);
    return errorMessage;
  };

  // Login function
  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('token', data.token);
      const profile = await fetchProfile();
      return profile;
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await authService.updatePassword(currentPassword, newPassword);
      // Re-fetch profile after password change
      await fetchProfile();
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    }
  };

  // Update email
  const updateEmail = async (newEmail, password) => {
    try {
      await authService.updateEmail(newEmail, password);
      // Re-fetch profile after email change
      await fetchProfile();
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    }
  };

  // Password reset
  const resetPassword = async (token, passwords) => {
    try {
      await authService.resetPassword(token, passwords);
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    }
  };

  // Check authentication status
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  // Check admin status
  const isAdmin = () => {
    return isAuthenticated() && user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticating,
    login,
    logout,
    updatePassword,
    updateEmail,
    resetPassword,
    forgotPassword,
    fetchProfile,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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