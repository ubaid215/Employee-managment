import api from './api';

// Employee leave functions
export const applyLeave = async (leaveData) => {
  try {
    const response = await api.post('/api/employee/leaves', leaveData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error applying for leave');
  }
};

export const getMyLeaves = async () => {
  try {
    const response = await api.get('/api/employee/leaves');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching your leaves');
  }
};

export const getMyLeaveAnalytics = async (year) => {
  try {
    const response = await api.get('/api/employee/leaves/analytics', {
      params: { year }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching leave analytics');
  }
};

// Admin leave functions
export const getAllLeaves = async (filters = {}) => {
  try {
    const response = await api.get('/api/admin/leaves', {
      params: filters
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching leaves');
  }
};

export const approveLeave = async (leaveId, actionData) => {
  try {
    const response = await api.patch(`/api/admin/leaves/${leaveId}/approve`, actionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error processing leave');
  }
};

export const getLeaveAnalytics = async (options = {}) => {
  try {
    const response = await api.get('/api/admin/leaves/analytics', {
      params: options
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching leave analytics');
  }
};

export const getLeaveById = async (leaveId) => {
  try {
    const response = await api.get(`/api/admin/leaves/${leaveId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching leave details');
  }
};