import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as employeeService from '../services/employeeService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch user profile on authentication
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && token) {
        setLoading(true);
        try {
          const userData = await employeeService.getProfile();
          setUser(userData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [isAuthenticated, token]);

  //get profile
  const getProfile = async () => {
    try {
      const getUser = await employeeService.getProfile();
      setUser(getUser);
      return getUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await employeeService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };


  // Update profile image
  const updateProfileImage = async (file) => {
    try {
      const response = await employeeService.updateProfileImage(file);
      setUser(response.data.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete profile image
  const deleteProfileImage = async () => {
    try {
      const response = await employeeService.deleteProfileImage();
      setUser(response.data.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Apply for leave
  const applyLeave = async (leaveData) => {
    try {
      const response = await employeeService.applyLeave(leaveData);
      await fetchMyLeaves();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get my leaves
  const fetchMyLeaves = async () => {
    try {
      const leavesData = await employeeService.getMyLeaves();
      setLeaves(leavesData);
      return leavesData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get leave analytics
  const getLeaveAnalytics = async (year) => {
    try {
      return await employeeService.getMyLeaveAnalytics(year);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get salary records
  const fetchSalary = async () => {
    try {
      const salaryData = await employeeService.getSalary();
      setSalaries(salaryData);
      return salaryData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Download salary PDF
  const downloadSalaryPDF = async () => {
    try {
      return await employeeService.downloadSalaryPDF();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get all departments
  const fetchDepartments = async () => {
    try {
      const departmentsData = await employeeService.getAllDepartments();
      setDepartments(departmentsData);
      return departmentsData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      return await employeeService.updatePassword(passwordData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update email
  const updateEmail = async (emailData) => {
    try {
      const response = await employeeService.updateEmail(emailData);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh all data
  const refreshData = async () => {
    if (isAuthenticated && token) {
      setLoading(true);
      try {
        await Promise.all([
          employeeService.getProfile().then(setUser),
          employeeService.getMyLeaves().then(setLeaves),
          employeeService.getSalary().then(setSalaries),
          employeeService.getAllDepartments().then(setDepartments),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        // State
        user,
        loading,
        error,
        leaves,
        salaries,
        departments,

        // Profile methods
        getProfile,
        updateProfile,
        updateProfileImage,
        deleteProfileImage,
        updatePassword,
        updateEmail,

        // Leave methods
        applyLeave,
        fetchMyLeaves,
        getLeaveAnalytics,

        // Salary methods
        fetchSalary,
        downloadSalaryPDF,

        // Department methods
        fetchDepartments,

        // Utility methods
        clearError,
        refreshData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);