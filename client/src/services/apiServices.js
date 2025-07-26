import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/*********************
 * AUTH SERVICES
 *********************/
const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgotPassword', { email }),
  resetPassword: (token, passwords) => 
    api.patch(`/auth/resetPassword/${token}`, passwords),
  updatePassword: (currentPassword, newPassword) => 
    api.patch('/auth/updatePassword', { currentPassword, newPassword }),
  updateEmail: (newEmail, password) => 
    api.patch('/auth/updateEmail', { newEmail, password }),
};

/*********************
 * EMPLOYEE SERVICES
 *********************/
const employeeService = {
  // Profile
  getProfile: () => api.get('/employees/me'),
  updateProfile: (profileData) => api.patch('/employees/me', profileData),
  
  // Profile Image
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('photo', imageFile);
    return api.patch('/employees/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProfileImage: () => api.delete('/employees/me/photo'),

  // Tasks
  submitTask: (dutyId, formData) => 
    api.post('/employees/submit-task', { dutyId, formData }),
  updateTask: (taskId, formData) => 
    api.put(`/employees/tasks/${taskId}`, formData),

  // Leaves
  applyLeave: (leaveData) => api.post('/employees/apply-leave', leaveData),
  getMyLeaves: () => api.get('/employees/my-leaves'),
  getLeaveAnalytics: () => api.get('/employees/my-leaves/analytics'),

  // Salary
  getSalaryRecords: () => api.get('/employees/salary'),
  downloadSalaryPDF: (salaryId) => 
    api.get(`/employees/salary/pdf/${salaryId}`, { responseType: 'blob' }),

  // Departments & Duties
  getDepartments: () => api.get('/employees/departments'),
  getAllDuties: () => api.get('/employees/duties'),
  getMyDuties: () => api.get('/employees/my-duties'),
  getMyDutyHistory: () => api.get('/employees/duty-history'),
};

/*********************
 * ADMIN SERVICES
 *********************/
const adminService = {
  // Departments
  createDepartment: (name) => api.post('/admin/departments', { name }),

  // Duties
  createDuty: (dutyData) => api.post('/admin/duties', dutyData),

  // Employees
  getAllEmployees: () => api.get('/admin/employees'),
  getEmployeeDetails: (id) => api.get(`/admin/employees/${id}`),
  assignDepartmentAndDuties: (userId, departmentId, dutyIds, reason) => 
    api.post('/admin/assign-duty', { userId, departmentId, dutyIds, reason }),
  changeEmployeeStatus: (userId, status) => 
    api.patch('/admin/change-status', { userId, status }),

  // Tasks
  getEmployeeTasks: (filters = {}) => 
    api.get('/admin/employee-tasks', { params: filters }),
  reviewTask: (taskId, status, feedback) => 
    api.patch(`/admin/tasks/${taskId}/review`, { status, feedback }),
  getEmployeeTaskStats: (employeeId) => 
    api.get(`/admin/employees/${employeeId}/task-stats`),

  // History
  getDepartmentHistory: (departmentId) => 
    api.get(`/admin/department-history/${departmentId}`),

  // Leaves
  getAllLeaves: (filters = {}) => 
    api.get('/admin/leaves', { params: filters }),
  getLeaveDetails: (leaveId) => api.get(`/admin/leaves/${leaveId}`),
  approveLeave: (leaveId, decision) => 
    api.patch(`/admin/leaves/${leaveId}`, decision),
  getLeaveAnalytics: () => api.get('/admin/leaves/analytics'),
  getAdvancedLeaveAnalytics: (filters = {}) => 
    api.get('/admin/leaves/advanced-analytics', { params: filters }),

  // Salary
  getAllSalaries: (filters = {}) => 
    api.get('/admin/salaries', { params: filters }),
  addSalary: (salaryData) => api.post('/admin/salaries', salaryData),
  updateSalary: (salaryId, updates) => 
    api.patch(`/admin/salaries/${salaryId}`, updates),
};

/*********************
 * EXPORT ALL SERVICES
 *********************/
export { authService, employeeService, adminService };