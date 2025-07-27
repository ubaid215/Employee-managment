/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { adminService } from '../services/apiServices';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentHistory, setDepartmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache and loading state tracking
  const cache = useRef({
    employees: { data: null, timestamp: null, loading: false },
    departments: { data: null, timestamp: null, loading: false },
    leaves: { data: null, timestamp: null, loading: false, filters: null },
    tasks: { data: null, timestamp: null, loading: false, filters: null },
    salaries: { data: null, timestamp: null, loading: false, filters: null },
  });

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Helper function to check if cache is valid
  const isCacheValid = (cacheKey) => {
    const cached = cache.current[cacheKey];
    return cached.data && 
           cached.timestamp && 
           (Date.now() - cached.timestamp) < CACHE_DURATION;
  };

  // Helper function to update cache
  const updateCache = (cacheKey, data, filters = null) => {
    cache.current[cacheKey] = {
      data,
      timestamp: Date.now(),
      loading: false,
      filters
    };
  };

  // Helper function to check if filters have changed
  const filtersChanged = (cacheKey, newFilters) => {
    const cached = cache.current[cacheKey];
    return JSON.stringify(cached.filters) !== JSON.stringify(newFilters);
  };

  // Fetch all employees with caching
  const fetchEmployees = useCallback(async (force = false) => {
    // Return cached data if valid and not forced
    if (!force && isCacheValid('employees')) {
      setEmployees(cache.current.employees.data);
      return;
    }

    // Prevent multiple simultaneous calls
    if (cache.current.employees.loading) {
      return;
    }

    cache.current.employees.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getAllEmployees();
      console.log('Employees API Response:', data);
      
      const employeesData = Array.isArray(data) ? data : [];
      setEmployees(employeesData);
      updateCache('employees', employeesData);
      setError(null);
    } catch (err) {
      console.error('Fetch employees error:', err);
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
      cache.current.employees.loading = false;
    }
  }, []);

  // Get single employee details with local cache check
  const getEmployeeDetails = useCallback(async (employeeId) => {
    try {
      // First try to find in local employees state
      const localEmployee = employees.find(emp => emp._id === employeeId);
      if (localEmployee && localEmployee.department && localEmployee.duties) {
        return localEmployee;
      }

      const { data } = await adminService.getEmployeeDetails(employeeId);
      
      // Update the employee in local state
      setEmployees(prev => 
        prev.map(emp => 
          emp._id === employeeId ? { ...emp, ...data.employee } : emp
        )
      );
      
      return data.employee;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee details');
      throw err;
    }
  }, [employees]);

  // Fetch all departments with caching
  const fetchDepartments = useCallback(async (force = false) => {
    if (!force && isCacheValid('departments')) {
      setDepartments(cache.current.departments.data);
      return;
    }

    if (cache.current.departments.loading) {
      return;
    }

    cache.current.departments.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getAllDepartments();
      console.log('Departments API Response:', data);
      
      const departmentsData = data?.data?.departments || data?.departments || [];
      setDepartments(departmentsData);
      updateCache('departments', departmentsData);
      setError(null);
    } catch (err) {
      console.error('Fetch departments error:', err);
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
      cache.current.departments.loading = false;
    }
  }, []);

  // Create department with cache invalidation
  const createDepartment = useCallback(async (name) => {
    try {
      const { data } = await adminService.createDepartment(name);
      
      // Update local state
      const newDepartments = [data.department, ...departments];
      setDepartments(newDepartments);
      
      // Update cache
      updateCache('departments', newDepartments);
      
      return data.department;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
      throw err;
    }
  }, [departments]);

  // Create duty (no caching needed as it's a single operation)
  const createDuty = useCallback(async (dutyData) => {
    try {
      const { data } = await adminService.createDuty(dutyData);
      return data.duty;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create duty');
      throw err;
    }
  }, []);

  // Assign department and duties with state updates
  const assignDepartment = useCallback(async (userId, departmentId, dutyIds, reason) => {
    try {
      const { data } = await adminService.assignDepartmentAndDuties(
        userId,
        departmentId,
        dutyIds,
        reason
      );
      
      // Update local employees state
      const updatedEmployees = employees.map(emp =>
        emp._id === userId
          ? { ...emp, department: data.department, duties: data.duties }
          : emp
      );
      setEmployees(updatedEmployees);
      
      // Update cache
      updateCache('employees', updatedEmployees);
      
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
      throw err;
    }
  }, [employees]);

  // Change employee status with state updates
  const changeEmployeeStatus = useCallback(async (userId, status) => {
    try {
      const { data } = await adminService.changeEmployeeStatus(userId, status);
      
      const updatedEmployees = employees.map(emp =>
        emp._id === userId ? { ...emp, status: status } : emp
      );
      setEmployees(updatedEmployees);
      
      // Update cache
      updateCache('employees', updatedEmployees);
      
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Status change failed');
      throw err;
    }
  }, [employees]);

  // Fetch employee tasks with caching and filter comparison
  const fetchEmployeeTasks = useCallback(async (filters = {}, force = false) => {
    const filtersKey = JSON.stringify(filters);
    
    if (!force && isCacheValid('tasks') && !filtersChanged('tasks', filters)) {
      setEmployeeTasks(cache.current.tasks.data);
      return;
    }

    if (cache.current.tasks.loading) {
      return;
    }

    cache.current.tasks.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getEmployeeTasks(filters);
      setEmployeeTasks(data.tasks);
      updateCache('tasks', data.tasks, filters);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee tasks');
    } finally {
      setLoading(false);
      cache.current.tasks.loading = false;
    }
  }, []);

  // Review task with optimistic updates
  const reviewTask = useCallback(async (taskId, status, feedback) => {
    try {
      // Optimistic update
      const optimisticUpdate = employeeTasks.map(task =>
        task._id === taskId ? { ...task, status, feedback, reviewedAt: new Date() } : task
      );
      setEmployeeTasks(optimisticUpdate);

      const { data } = await adminService.reviewTask(taskId, status, feedback);
      
      // Update with actual response
      setEmployeeTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, ...data.task } : task
        )
      );
      
      return data.task;
    } catch (err) {
      // Revert optimistic update on error
      setEmployeeTasks(employeeTasks);
      setError(err.response?.data?.message || 'Task review failed');
      throw err;
    }
  }, [employeeTasks]);

  // Get employee task stats (no caching for stats as they change frequently)
  const getEmployeeTaskStats = useCallback(async (employeeId) => {
    try {
      const { data } = await adminService.getEmployeeTaskStats(employeeId);
      return data.stats;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task stats');
      throw err;
    }
  }, []);

  // Fetch all leaves with caching and filter comparison
  const fetchAllLeaves = useCallback(async (filters = {}, force = false) => {
    if (!force && isCacheValid('leaves') && !filtersChanged('leaves', filters)) {
      setAllLeaves(cache.current.leaves.data);
      return;
    }

    if (cache.current.leaves.loading) {
      return;
    }

    cache.current.leaves.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getAllLeaves(filters);
      console.log('Leaves API Response:', data);
      
      const leavesData = data?.data?.leaves || data?.leaves || [];
      setAllLeaves(leavesData);
      updateCache('leaves', leavesData, filters);
      setError(null);
    } catch (err) {
      console.error('Fetch leaves error:', err);
      setError(err.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
      cache.current.leaves.loading = false;
    }
  }, []);

  // Get leave details with local cache check
  const getLeaveDetails = useCallback(async (leaveId) => {
    try {
      // First try to find in local leaves state
      const localLeave = allLeaves.find(leave => leave._id === leaveId);
      if (localLeave && localLeave.employee && localLeave.type) {
        return localLeave;
      }

      const { data } = await adminService.getLeaveDetails(leaveId);
      return data.leave;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave details');
      throw err;
    }
  }, [allLeaves]);

  // Process leave with optimistic updates
  const processLeave = useCallback(async (leaveId, decision) => {
    try {
      // Optimistic update
      const optimisticUpdate = allLeaves.map(leave =>
        leave._id === leaveId ? { ...leave, status: decision.status, processedAt: new Date() } : leave
      );
      setAllLeaves(optimisticUpdate);

      const { data } = await adminService.approveLeave(leaveId, decision);
      
      // Update with actual response
      setAllLeaves(prev =>
        prev.map(leave =>
          leave._id === leaveId ? { ...leave, ...data.leave } : leave
        )
      );
      
      return data.leave;
    } catch (err) {
      // Revert optimistic update on error
      setAllLeaves(allLeaves);
      setError(err.response?.data?.message || 'Leave processing failed');
      throw err;
    }
  }, [allLeaves]);

  // Get leave analytics (no caching for analytics)
  const getLeaveAnalytics = useCallback(async () => {
    try {
      const { data } = await adminService.getLeaveAnalytics();
      return data.analytics;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave analytics');
      throw err;
    }
  }, []);

  // Get advanced leave analytics (no caching for analytics)
  const getAdvancedLeaveAnalytics = useCallback(async (filters = {}) => {
    try {
      const { data } = await adminService.getAdvancedLeaveAnalytics(filters);
      return data.analytics;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advanced analytics');
      throw err;
    }
  }, []);

  // Fetch department history (no caching as it's specific to department)
  const fetchDepartmentHistory = useCallback(async (departmentId) => {
    setLoading(true);
    try {
      const { data } = await adminService.getDepartmentHistory(departmentId);
      setDepartmentHistory(data.history);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch salaries with caching and filter comparison
  const fetchSalaries = useCallback(async (filters = {}, force = false) => {
    if (!force && isCacheValid('salaries') && !filtersChanged('salaries', filters)) {
      setSalaries(cache.current.salaries.data);
      return;
    }

    if (cache.current.salaries.loading) {
      return;
    }

    cache.current.salaries.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getAllSalaries(filters);
      setSalaries(data.salaries);
      updateCache('salaries', data.salaries, filters);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salaries');
    } finally {
      setLoading(false);
      cache.current.salaries.loading = false;
    }
  }, []);

  // Add salary with cache updates
  const addSalary = useCallback(async (salaryData) => {
    try {
      const { data } = await adminService.addSalary(salaryData);
      
      const updatedSalaries = [data.salary, ...salaries];
      setSalaries(updatedSalaries);
      
      // Update cache
      updateCache('salaries', updatedSalaries, cache.current.salaries.filters);
      
      return data.salary;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add salary');
      throw err;
    }
  }, [salaries]);

  // Update salary with cache updates
  const updateSalary = useCallback(async (salaryId, updates) => {
    try {
      const { data } = await adminService.updateSalary(salaryId, updates);
      
      const updatedSalaries = salaries.map(salary =>
        salary._id === salaryId ? { ...salary, ...data.salary } : salary
      );
      setSalaries(updatedSalaries);
      
      // Update cache
      updateCache('salaries', updatedSalaries, cache.current.salaries.filters);
      
      return data.salary;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salary');
      throw err;
    }
  }, [salaries]);

  // Clear cache function for manual cache invalidation
  const clearCache = useCallback((cacheKey = null) => {
    if (cacheKey) {
      cache.current[cacheKey] = { data: null, timestamp: null, loading: false, filters: null };
    } else {
      // Clear all cache
      Object.keys(cache.current).forEach(key => {
        cache.current[key] = { data: null, timestamp: null, loading: false, filters: null };
      });
    }
  }, []);

  const value = {
    employees,
    allLeaves,
    employeeTasks,
    salaries,
    departments,
    departmentHistory,
    loading,
    error,
    fetchEmployees,
    getEmployeeDetails,
    fetchDepartments,
    createDepartment,
    createDuty,
    assignDepartment,
    changeEmployeeStatus,
    fetchEmployeeTasks,
    reviewTask,
    getEmployeeTaskStats,
    fetchAllLeaves,
    getLeaveDetails,
    processLeave,
    getLeaveAnalytics,
    getAdvancedLeaveAnalytics,
    fetchDepartmentHistory,
    fetchSalaries,
    addSalary,
    updateSalary,
    clearCache // Expose cache clearing function
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};