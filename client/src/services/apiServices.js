import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Request queue and rate limiting
class RequestQueue {
  constructor(maxConcurrent = 3, delayBetweenRequests = 100) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
    this.delay = delayBetweenRequests;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      // Add delay between requests
      setTimeout(() => this.process(), this.delay);
    }
  }
}

const requestQueue = new RequestQueue(3, 200); // Max 3 concurrent, 200ms delay

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request cache
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Cache key generator
const getCacheKey = (config) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
};

// Add request interceptor for auth token and caching
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add cache check for GET requests
  if (config.method === 'get') {
    const cacheKey = getCacheKey(config);
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Return cached response
      config.adapter = () => Promise.resolve(cached.response);
    }
  }

  return config;
});

// Add response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = getCacheKey(response.config);
      requestCache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      console.warn('Rate limit hit. Retrying after delay...');
      // You could implement retry logic here
    }
    return Promise.reject(error);
  }
);

// Wrapper function for queued requests
const queuedRequest = (requestFn) => {
  return requestQueue.add(requestFn);
};

/*********************
 * AUTH SERVICES
 *********************/
const authService = {
  register: (userData) => queuedRequest(() => api.post('/auth/register', userData)),
  login: (credentials) => queuedRequest(() => api.post('/auth/login', credentials)),
  logout: () => queuedRequest(() => api.post('/auth/logout')),
  forgotPassword: (email) => queuedRequest(() => api.post('/auth/forgotPassword', { email })),
  resetPassword: (token, passwords) => 
    queuedRequest(() => api.patch(`/auth/resetPassword/${token}`, passwords)),
  updatePassword: (currentPassword, newPassword) => 
    queuedRequest(() => api.patch('/auth/updatePassword', { currentPassword, newPassword })),
  updateEmail: (newEmail, password) => 
    queuedRequest(() => api.patch('/auth/updateEmail', { newEmail, password })),
};

/*********************
 * EMPLOYEE SERVICES
 *********************/
const employeeService = {
  // Profile
  getProfile: () => queuedRequest(() => api.get('/employee/me')),
  updateProfile: (profileData) => queuedRequest(() => api.patch('/employee/me', profileData)),
  
  // Profile Image
  updateProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile); 
    return queuedRequest(() => api.patch('/employee/me/photo', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    }));
  },
  deleteProfileImage: () => queuedRequest(() => api.delete('/employee/me/photo')),

  // Tasks
  submitTask: (dutyId, formData, forceNew = false) => 
    queuedRequest(() => api.post('/employee/submit-task', { dutyId, formData, forceNew })),
  
  // Note: Backend handles both create/update via submitTask
  updateTask: (dutyId, formData) => 
    queuedRequest(() => api.post('/employee/submit-task', { dutyId, formData })),

  // Leaves
  applyLeave: (leaveData) => queuedRequest(() => api.post('/employee/apply-leave', leaveData)),
  getMyLeaves: () => queuedRequest(() => api.get('/employee/my-leaves')),
  getLeaveAnalytics: (year) => queuedRequest(() => 
    api.get('/employee/my-leaves/analytics', { params: { year } })),

  // Salary
  getSalaryRecords: () => queuedRequest(() => api.get('/employee/salary')),
  downloadSalaryPDF: (salaryId = '') => 
    queuedRequest(() => api.get(`/employee/salary/pdf/${salaryId}`, { responseType: 'blob' })),

  // Departments & Duties
  getDepartments: () => queuedRequest(() => api.get('/employee/departments')),
  getAllDuties: () => queuedRequest(() => api.get('/employee/duties')),
  getMyDuties: () => queuedRequest(() => api.get('/employee/my-duties')),
  getMyDutyHistory: () => queuedRequest(() => api.get('/employee/duty-history')),
};

/*********************
 * ADMIN SERVICES - UPDATED
 *********************/
const adminService = {
  // Departments - Full CRUD operations
  getDepartments: (params = {}) => 
    queuedRequest(() => api.get('/admin/departments', { params })),
  getDepartment: (id) => 
    queuedRequest(() => api.get(`/admin/departments/${id}`)),
  createDepartment: (data) => 
    queuedRequest(() => api.post('/admin/departments', data)),
  updateDepartment: (id, data) => 
    queuedRequest(() => api.patch(`/admin/departments/${id}`, data)),
  deleteDepartment: (id, transferId = null) => 
    queuedRequest(() => api.delete(`/admin/departments/${id}`, { 
      data: transferId ? { transferDepartmentId: transferId } : {} 
    })),
  getDepartmentAnalytics: () => 
    queuedRequest(() => api.get('/admin/departments/analytics/stats')),
  getDepartmentHistory: (id) => 
    queuedRequest(() => api.get(`/admin/department-history/${id}`)),

  // Duties
  getDuties: (params = {}) => 
    queuedRequest(() => api.get('/admin/duties', { params })),
  createDuty: (data) => 
    queuedRequest(() => api.post('/admin/duties', data)),
  updateDuty: (id, data) =>                                    
    queuedRequest(() => api.patch(`/admin/duties/${id}`, data)),
  deleteDuty: (id) =>                                         
    queuedRequest(() => api.delete(`/admin/duties/${id}`)),
  getDutyFormSchema: (id) => 
    queuedRequest(() => api.get(`/admin/duties/${id}/form-schema`)),
  assignDepartmentAndDuties: (data) => 
    queuedRequest(() => api.post('/admin/assign-duty', data)),
  updateDepartmentAndDuties: (data) => 
    queuedRequest(() => api.patch('/admin/assign-duty', data)),

  // Employees
  getEmployees: (params = {}) => 
    queuedRequest(() => api.get('/admin/employees', { params })),
  getEmployee: (id) => 
    queuedRequest(() => api.get(`/admin/employees/${id}`)),
  assignEmployeeDuties: (userId, departmentId, dutyIds, reason) => 
    queuedRequest(() => api.patch('/admin/assign-duty', { userId, departmentId, dutyIds, reason })),
  updateEmployeeStatus: (userId, status) => 
    queuedRequest(() => api.patch('/admin/change-status', { userId, status })),

  // Tasks
  getTasks: (params = {}) => 
    queuedRequest(() => api.get('/admin/employee-tasks', { params })),
  reviewTask: (id, status, feedback) => 
    queuedRequest(() => api.patch(`/admin/tasks/${id}/review`, { status, feedback })),
  getEmployeeTaskStats: (id) => 
    queuedRequest(() => api.get(`/admin/employees/${id}/task-stats`)),

  // Leaves
  getLeaves: (params = {}) => 
    queuedRequest(() => api.get('/admin/leaves', { params })),
  getLeave: (id) => 
    queuedRequest(() => api.get(`/admin/leaves/${id}`)),
  updateLeaveStatus: (id, decision) => 
    queuedRequest(() => api.patch(`/admin/leaves/${id}`, decision)),
  approveLeave: (id, decision) => 
  queuedRequest(() => api.patch(`/admin/leaves/${id}`, decision)),
  getLeaveAnalytics: () => 
    queuedRequest(() => api.get('/admin/leaves/analytics')),
  getAdvancedLeaveAnalytics: (params = {}) => 
    queuedRequest(() => api.get('/admin/leaves/advanced-analytics', { params })),

  // Salaries
  getSalaries: (params = {}) => 
    queuedRequest(() => api.get('/admin/salaries', { params })),
  createSalary: (data) => 
    queuedRequest(() => api.post('/admin/salaries', data)),
  updateSalary: (id, data) => 
    queuedRequest(() => api.patch(`/admin/salaries/${id}`, data)),
};

export default adminService;

// Clear cache function
export const clearApiCache = () => {
  requestCache.clear();
};

/*********************
 * EXPORT ALL SERVICES
 *********************/
export { authService, employeeService, adminService };