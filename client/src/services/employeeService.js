import api from './api';

// Profile related functions
export const getProfile = async () => {
  try {
    const response = await api.get('/api/employee/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching profile');
  }
};

export const updateProfile = async (updates) => {
  try {
    const response = await api.patch('/api/employee/me', updates);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating profile');
  }
};

export const updateProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  try {
    const response = await api.patch('/api/employee/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating profile image');
  }
};

export const deleteProfileImage = async () => {
  try {
    const response = await api.delete('/api/employee/me/profile-image');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting profile image');
  }
};

// Leave related functions
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
    throw new Error(error.response?.data?.message || 'Error fetching leaves');
  }
};

export const getMyLeaveAnalytics = async (year) => {
  try {
    const response = await api.get('/api/employee/leaves/analytics', {
      params: { year },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching leave analytics');
  }
};

// Salary related functions
export const getSalary = async () => {
  try {
    const response = await api.get('/api/employee/salaries');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching salary records');
  }
};

export const downloadSalaryPDF = async () => {
  try {
    const response = await api.get('/api/employee/salaries/export', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'salary-records.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error downloading salary PDF');
  }
};

// Department functions
export const getAllDepartments = async () => {
  try {
    const response = await api.get('/api/departments');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching departments');
  }
};

// Auth related functions
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.patch('/api/auth/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating password');
  }
};

export const updateEmail = async (emailData) => {
  try {
    const response = await api.patch('/api/auth/update-email', emailData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating email');
  }
};