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
  submitTask: (dutyId, formData) => 
    queuedRequest(() => api.post('/employee/tasks', { dutyId, ...formData })),
  updateTask: (taskId, formData) => 
    queuedRequest(() => api.put(`/employee/tasks/${taskId}`, formData)),

  // Leaves
  applyLeave: (leaveData) => queuedRequest(() => api.post('/employee/apply-leave', leaveData)),
  getMyLeaves: () => queuedRequest(() => api.get('/employee/my-leaves')),
  getLeaveAnalytics: () => queuedRequest(() => api.get('/employee/my-leaves/analytics')),

  // Salary
  getSalaryRecords: () => queuedRequest(() => api.get('/employee/salary')),
  downloadSalaryPDF: (salaryId) => 
    queuedRequest(() => api.get(`/employee/salary/pdf/${salaryId}`, { responseType: 'blob' })),

  // Departments & Duties
  getDepartments: () => queuedRequest(() => api.get('/employee/departments')),
  getAllDuties: () => queuedRequest(() => api.get('/employee/duties')),
  getMyDuties: () => queuedRequest(() => api.get('/employee/my-duties')),
  getMyDutyHistory: () => queuedRequest(() => api.get('/employee/duty-history')),
};

/*********************
 * ADMIN SERVICES
 *********************/
const adminService = {
  // Departments
  createDepartment: (name) => queuedRequest(() => api.post('/admin/departments', { name })),

  // Duties
  createDuty: (dutyData) => queuedRequest(() => api.post('/admin/duties', dutyData)),

  // Employees
  getAllEmployees: () => queuedRequest(() => api.get('/admin/employees')),
  getEmployeeDetails: (id) => queuedRequest(() => api.get(`/admin/employees/${id}`)),
  assignDepartmentAndDuties: (userId, departmentId, dutyIds, reason) => 
    queuedRequest(() => api.post('/admin/assign-duty', { userId, departmentId, dutyIds, reason })),
  changeEmployeeStatus: (userId, status) => 
    queuedRequest(() => api.patch('/admin/change-status', { userId, status })),

  // Tasks
  getEmployeeTasks: (filters = {}) => 
    queuedRequest(() => api.get('/admin/employee-tasks', { params: filters })),
  reviewTask: (taskId, status, feedback) => 
    queuedRequest(() => api.patch(`/admin/tasks/${taskId}/review`, { status, feedback })),
  getEmployeeTaskStats: (employeeId) => 
    queuedRequest(() => api.get(`/admin/employees/${employeeId}/task-stats`)),

  // History
  getDepartmentHistory: (departmentId) => 
    queuedRequest(() => api.get(`/admin/department-history/${departmentId}`)),

  // Leaves
  getAllLeaves: (filters = {}) => 
    queuedRequest(() => api.get('/admin/leaves', { params: filters })),
  getLeaveDetails: (leaveId) => queuedRequest(() => api.get(`/admin/leaves/${leaveId}`)),
  approveLeave: (leaveId, decision) => 
    queuedRequest(() => api.patch(`/admin/leaves/${leaveId}`, decision)),
  getLeaveAnalytics: () => queuedRequest(() => api.get('/admin/leaves/analytics')),
  getAdvancedLeaveAnalytics: (filters = {}) => 
    queuedRequest(() => api.get('/admin/leaves/advanced-analytics', { params: filters })),

  // Salary
  getAllSalaries: (filters = {}) => 
    queuedRequest(() => api.get('/admin/salaries', { params: filters })),
  addSalary: (salaryData) => queuedRequest(() => api.post('/admin/salaries', salaryData)),
  updateSalary: (salaryId, updates) => 
    queuedRequest(() => api.patch(`/admin/salaries/${salaryId}`, updates)),
};

// Clear cache function
export const clearApiCache = () => {
  requestCache.clear();
};

/*********************
 * EXPORT ALL SERVICES
 *********************/
export { authService, employeeService, adminService };