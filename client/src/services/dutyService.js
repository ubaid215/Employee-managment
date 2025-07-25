import api from './api';

// Employee duty functions
export const getDuties = async () => {
  try {
    const response = await api.get('/api/employee/duties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching duties');
  }
};

export const submitTask = async (dutyId, formData) => {
  try {
    const response = await api.post('/api/employee/submit-task', {
      dutyId,
      formData,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error submitting task');
  }
};

// Admin duty functions
export const getTaskLogs = async (filters = {}) => {
  try {
    const response = await api.get('/api/admin/tasks', {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching task logs');
  }
};

export const reviewTask = async (taskId, status, feedback) => {
  try {
    const response = await api.patch(`/api/admin/tasks/${taskId}/review`, {
      status,
      feedback,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error reviewing task');
  }
};

export const getTaskStats = async (employeeId) => {
  try {
    const response = await api.get(`/api/admin/employees/${employeeId}/task-stats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching task stats');
  }
};

export const getAllDuties = async () => {
  try {
    const response = await api.get('/api/duties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching all duties');
  }
};