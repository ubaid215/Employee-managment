import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import * as leaveService from '../services/leaveService';

const LeaveContext = createContext();

export const LeaveProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const [leaves, setLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch leaves based on user role
  const fetchLeaves = async (filters = {}) => {
    setLoading(true);
    try {
      let leavesData;
      if (user?.role === 'admin') {
        leavesData = await leaveService.getAllLeaves(filters);
      } else {
        leavesData = await leaveService.getMyLeaves();
      }
      setLeaves(leavesData.data || leavesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLeaves();
    }
  }, [isAuthenticated, user]);

  // Apply for leave
  const applyLeave = async (leaveData) => {
    setLoading(true);
    try {
      const response = await leaveService.applyLeave(leaveData);
      setLeaves(prev => [...prev, response.leave]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve/reject leave (admin only)
  const approveLeave = async (leaveId, actionData) => {
    setLoading(true);
    try {
      const response = await leaveService.approveLeave(leaveId, actionData);
      setLeaves(prev => 
        prev.map(leave => 
          leave._id === leaveId ? response.leave : leave
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get leave analytics
  const getLeaveAnalytics = async (options = {}) => {
    setLoading(true);
    try {
      let analyticsData;
      if (user?.role === 'admin') {
        analyticsData = await leaveService.getLeaveAnalytics(options);
      } else {
        analyticsData = await leaveService.getMyLeaveAnalytics(options.year);
      }
      setAnalytics(analyticsData.data);
      return analyticsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get single leave details
  const getLeaveById = async (leaveId) => {
    setLoading(true);
    try {
      const response = await leaveService.getLeaveById(leaveId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <LeaveContext.Provider
      value={{
        // State
        leaves,
        analytics,
        loading,
        error,

        // Methods
        fetchLeaves,
        applyLeave,
        approveLeave,
        getLeaveAnalytics,
        getLeaveById,
        clearError
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => useContext(LeaveContext);