import api from './api';

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Register new employee
export const register = async (userData) => {
  try {
    const { name, email, password, passwordConfirm, phone, cnic } = userData;
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
      passwordConfirm,
      phone,
      cnic
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgotPassword', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error sending reset email');
  }
};

// Reset password
export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const response = await api.patch(`/api/auth/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error resetting password');
  }
};

// Update password (for logged-in users)
export const updatePassword = async (currentPassword, password, passwordConfirm) => {
  try {
    const response = await api.patch('/api/auth/updatePassword', {
      currentPassword,
      password,
      passwordConfirm,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating password');
  }
};

// Update email (for logged-in users)
export const updateEmail = async (newEmail, password) => {
  try {
    const response = await api.patch('/api/auth/updateEmail', {
      newEmail,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating email');
  }
};

// Check authentication status
export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/api/employee/me');
    console.log('✅ Auth check successful');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Authentication check failed');
  }
};