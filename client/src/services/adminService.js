import api from './api';

// Assign department and duties to employee
export const assignDepartmentAndDuties = async (userId, departmentId, dutyIds, reason) => {
  try {
    const response = await api.post('/api/admin/assign-department-duties', {
      userId,
      departmentId,
      dutyIds,
      reason,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error assigning department and duties');
  }
};

// Change employee status
export const changeStatus = async (userId, status) => {
  try {
    const response = await api.post('/api/admin/change-status', {
      userId,
      status,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error changing status');
  }
};

// Fetch all employees
export const getAllEmployees = async () => {
  try {
    const response = await api.get('/api/admin/employees');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching employees');
  }
};

// Fetch department history
export const getDepartmentHistory = async (departmentId) => {
  try {
    const response = await api.get(`/api/admin/department/${departmentId}/history`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching department history');
  }
};

// Create department
export const createDepartment = async (name) => {
  try {
    const response = await api.post('/api/admin/department', { name });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating department');
  }
};

// Create duty
export const createDuty = async ({ title, description, department, formSchema }) => {
  try {
    const response = await api.post('/api/admin/duty', {
      title,
      description,
      department,
      formSchema,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating duty');
  }
};

// Fetch all departments
export const getAllDepartments = async () => {
  try {
    const response = await api.get('/api/departments');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching departments');
  }
};

// Fetch all duties
export const getAllDuties = async () => {
  try {
    const response = await api.get('/api/duties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching duties');
  }
};