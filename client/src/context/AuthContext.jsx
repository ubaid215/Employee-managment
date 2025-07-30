import { createContext, useContext, useEffect, useState } from "react";
import { authService, employeeService } from "../services/apiServices";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
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

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const { data } = await employeeService.getProfile();
      setUser(data);
      setError(null);
      return data;
    } catch (err) {
      handleAuthError(err);
      throw err;
    }
  };

  // Handle authentication errors
  const handleAuthError = (err) => {
    console.error("Auth error:", err);
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        "Authentication failed";
    setError(errorMessage);
    localStorage.removeItem("token");
    setUser(null);
    return errorMessage;
  };

  // Login function
  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem("token", data.token);
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
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setError(null);
    }
  };

  const register = async (userData) => {
    setIsAuthenticating(true);
    try {
      const { data } = await authService.register(userData);
      
      // Store the token if you want to automatically log in after registration
      if (data.token) {
        localStorage.setItem("token", data.token);
        await fetchProfile();
      }
      
      return data;
    } catch (err) {
      const message = handleAuthError(err);
      throw new Error(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Update profile with image handling
  const updateProfileImage = async (profileData, profileImage) => {
  setIsAuthenticating(true);
  try {
    let updatedData = { ...profileData };
    let imageUrl = null;

    // Handle image upload if provided
    if (profileImage) {
      try {
        const uploadResponse = await employeeService.updateProfileImage(profileImage);
        imageUrl = uploadResponse.data.imageUrl;
        updatedData.profile = {
          ...updatedData.profile,
          profileImage: imageUrl
        };
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw new Error(
          uploadError.response?.data?.message || 
          'Failed to upload profile image'
        );
      }
    }

    // Update profile data
    const { data } = await employeeService.updateProfile(updatedData);
    
    // Update local state
    setUser(prev => ({
      ...prev,
      ...data,
      profile: {
        ...prev?.profile,
        ...data?.profile,
        profileImage: imageUrl || prev?.profile?.profileImage
      }
    }));

    return data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Profile update failed';
    setError(message);
    throw new Error(message);
  } finally {
    setIsAuthenticating(false);
  }
};

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await authService.updatePassword(currentPassword, newPassword);
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
    return !!user && !!localStorage.getItem("token");
  };

  // Check admin status
  const isAdmin = () => {
    return isAuthenticated() && user?.role === "admin";
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticating,
    login,
    register,
    logout,
    updateProfileImage,
    updatePassword,
    updateEmail,
    resetPassword,
    forgotPassword,
    fetchProfile,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};