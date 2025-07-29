import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { adminService } from '../services/apiServices';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [duties, setDuties] = useState([]);
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
    duties: { data: null, timestamp: null, loading: false }
  });

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Helper function to check if cache is valid
  const isCacheValid = (cacheKey) => {
    const cached = cache.current[cacheKey];
    return cached.data && cached.timestamp && (Date.now() - cached.timestamp) < CACHE_DURATION;
  };

  const updateCache = (cacheKey, data, filters = null) => {
    cache.current[cacheKey] = {
      data,
      timestamp: Date.now(),
      loading: false,
      filters
    };
  };

  const filtersChanged = (cacheKey, newFilters) => {
    const cached = cache.current[cacheKey];
    return JSON.stringify(cached.filters) !== JSON.stringify(newFilters);
  };

  // Department-related functions
  const fetchDepartments = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('departments') && !filtersChanged('departments', params)) {
      setDepartments(cache.current.departments.data);
      return;
    }

    if (cache.current.departments.loading) return;

    cache.current.departments.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getDepartments(params);
      const departmentsData = Array.isArray(data) ? data : data?.data?.departments || [];
      setDepartments(departmentsData);
      updateCache('departments', departmentsData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
      cache.current.departments.loading = false;
    }
  }, []);

  const getDepartment = useCallback(async (id) => {
    try {
      const localDept = departments.find(d => d._id === id);
      if (localDept) return localDept;

      setLoading(true);
      const { data } = await adminService.getDepartment(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [departments]);

  const createDepartment = useCallback(async (departmentData) => {
    try {
      setLoading(true);
      const { data } = await adminService.createDepartment(departmentData);
      
      setDepartments(prev => [data, ...prev]);
      updateCache('departments', [data, ...departments]);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [departments]);

  const updateDepartment = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const { data } = await adminService.updateDepartment(id, updates);
      
      setDepartments(prev => 
        prev.map(dept => dept._id === id ? { ...dept, ...data } : dept)
      );
      updateCache('departments', departments.map(dept => 
        dept._id === id ? { ...dept, ...data } : dept
      ));
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [departments]);

  const deleteDepartment = useCallback(async (id, transferId = null) => {
    try {
      setLoading(true);
      await adminService.deleteDepartment(id, transferId);
      
      setDepartments(prev => prev.filter(dept => dept._id !== id));
      updateCache('departments', departments.filter(dept => dept._id !== id));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [departments]);

  const getDepartmentAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminService.getDepartmentAnalytics();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch department analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Employee-related functions
  const fetchEmployees = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('employees') && !filtersChanged('employees', params)) {
      setEmployees(cache.current.employees.data);
      return;
    }

    if (cache.current.employees.loading) return;

    cache.current.employees.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getEmployees(params);
      const employeesData = Array.isArray(data) ? data : data?.data?.employees || [];
      setEmployees(employeesData);
      updateCache('employees', employeesData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
      cache.current.employees.loading = false;
    }
  }, []);

  const getEmployee = useCallback(async (id) => {
    try {
      const localEmployee = employees.find(emp => emp._id === id);
      if (localEmployee) return localEmployee;

      setLoading(true);
      const { data } = await adminService.getEmployee(id);
      
      // Update local state if employee exists
      if (localEmployee) {
        setEmployees(prev => prev.map(emp => 
          emp._id === id ? { ...emp, ...data } : emp
        ));
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Alias for getEmployee to match component usage
  const getEmployeeDetails = getEmployee;

  const assignEmployeeDuties = useCallback(async (userId, departmentId, dutyIds, reason) => {
    try {
      const { data } = await adminService.assignEmployeeDuties(
        userId,
        departmentId,
        dutyIds,
        reason
      );
      
      setEmployees(prev => prev.map(emp =>
        emp._id === userId
          ? { ...emp, department: data.department, duties: data.duties }
          : emp
      ));
      updateCache('employees', employees.map(emp =>
        emp._id === userId
          ? { ...emp, department: data.department, duties: data.duties }
          : emp
      ));
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
      throw err;
    }
  }, [employees]);

  const updateEmployeeStatus = useCallback(async (userId, status) => {
    try {
      const { data } = await adminService.updateEmployeeStatus(userId, status);
      
      setEmployees(prev => prev.map(emp =>
        emp._id === userId ? { ...emp, status } : emp
      ));
      updateCache('employees', employees.map(emp =>
        emp._id === userId ? { ...emp, status } : emp
      ));
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
      throw err;
    }
  }, [employees]);

  // Alias for updateEmployeeStatus to match component usage
  const changeEmployeeStatus = updateEmployeeStatus;

  // Duty-related functions
  const fetchDuties = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('duties') && !filtersChanged('duties', params)) {
      setDuties(cache.current.duties.data);
      return;
    }

    if (cache.current.duties.loading) return;

    cache.current.duties.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getDuties(params);
      const dutiesData = Array.isArray(data) ? data : data?.data?.duties || [];
      setDuties(dutiesData);
      updateCache('duties', dutiesData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch duties');
    } finally {
      setLoading(false);
      cache.current.duties.loading = false;
    }
  }, []);

  const createDuty = useCallback(async (dutyData) => {
    try {
      setLoading(true);
      const { data } = await adminService.createDuty(dutyData);
      
      setDuties(prev => [data, ...prev]);
      cache.current.duties = { data: null, timestamp: null, loading: false };
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create duty');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDutyFormSchema = useCallback(async (id) => {
    try {
      setLoading(true);
      const { data } = await adminService.getDutyFormSchema(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch form schema');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // New duty assignment functions
  const assignDepartmentAndDuties = useCallback(async (assignmentData) => {
    try {
      setLoading(true);
      const { data } = await adminService.assignDepartmentAndDuties(assignmentData);
      
      // Update employee in local state
      if (assignmentData.userId) {
        setEmployees(prev => prev.map(emp =>
          emp._id === assignmentData.userId
            ? { ...emp, department: data.department, duties: data.duties }
            : emp
        ));
        updateCache('employees', employees.map(emp =>
          emp._id === assignmentData.userId
            ? { ...emp, department: data.department, duties: data.duties }
            : emp
        ));
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign department and duties');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  const updateDepartmentAndDuties = useCallback(async (updateData) => {
    try {
      setLoading(true);
      const { data } = await adminService.updateDepartmentAndDuties(updateData);
      
      // Update employee in local state
      if (updateData.userId) {
        setEmployees(prev => prev.map(emp =>
          emp._id === updateData.userId
            ? { ...emp, department: data.department, duties: data.duties }
            : emp
        ));
        updateCache('employees', employees.map(emp =>
          emp._id === updateData.userId
            ? { ...emp, department: data.department, duties: data.duties }
            : emp
        ));
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department and duties');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Task-related functions
  const fetchEmployeeTasks = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('tasks') && !filtersChanged('tasks', params)) {
      setEmployeeTasks(cache.current.tasks.data);
      return;
    }

    if (cache.current.tasks.loading) return;

    cache.current.tasks.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getTasks(params);
      const tasksData = Array.isArray(data) ? data : data?.data?.tasks || [];
      setEmployeeTasks(tasksData);
      updateCache('tasks', tasksData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
      cache.current.tasks.loading = false;
    }
  }, []);

  const reviewTask = useCallback(async (id, status, feedback) => {
    try {
      // Optimistic update
      setEmployeeTasks(prev => prev.map(task =>
        task._id === id ? { ...task, status, feedback, reviewedAt: new Date() } : task
      ));

      const { data } = await adminService.reviewTask(id, status, feedback);
      
      // Update with actual response
      setEmployeeTasks(prev => prev.map(task =>
        task._id === id ? { ...task, ...data } : task
      ));
      
      return data;
    } catch (err) {
      // Revert optimistic update on error
      setEmployeeTasks(employeeTasks);
      setError(err.response?.data?.message || 'Task review failed');
      throw err;
    }
  }, [employeeTasks]);

  const getEmployeeTaskStats = useCallback(async (id) => {
    try {
      const { data } = await adminService.getEmployeeTaskStats(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task stats');
      throw err;
    }
  }, []);

  // Leave-related functions
  const fetchAllLeaves = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('leaves') && !filtersChanged('leaves', params)) {
      setAllLeaves(cache.current.leaves.data);
      return;
    }

    if (cache.current.leaves.loading) return;

    cache.current.leaves.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getLeaves(params);
      const leavesData = Array.isArray(data) ? data : data?.data?.leaves || [];
      setAllLeaves(leavesData);
      updateCache('leaves', leavesData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
      cache.current.leaves.loading = false;
    }
  }, []);

  const getLeave = useCallback(async (id) => {
    try {
      const localLeave = allLeaves.find(leave => leave._id === id);
      if (localLeave) return localLeave;

      setLoading(true);
      const { data } = await adminService.getLeave(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [allLeaves]);

  const updateLeaveStatus = useCallback(async (id, decision) => {
    try {
      // Optimistic update
      setAllLeaves(prev => prev.map(leave =>
        leave._id === id ? { ...leave, status: decision.status, processedAt: new Date() } : leave
      ));

      const { data } = await adminService.updateLeaveStatus(id, decision);
      
      // Update with actual response
      setAllLeaves(prev => prev.map(leave =>
        leave._id === id ? { ...leave, ...data } : leave
      ));
      
      return data;
    } catch (err) {
      // Revert optimistic update on error
      setAllLeaves(allLeaves);
      setError(err.response?.data?.message || 'Leave update failed');
      throw err;
    }
  }, [allLeaves]);

  const getLeaveAnalytics = useCallback(async () => {
    try {
      const { data } = await adminService.getLeaveAnalytics();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave analytics');
      throw err;
    }
  }, []);

  const getAdvancedLeaveAnalytics = useCallback(async (params = {}) => {
    try {
      const { data } = await adminService.getAdvancedLeaveAnalytics(params);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advanced analytics');
      throw err;
    }
  }, []);

  // Salary-related functions
  const fetchSalaries = useCallback(async (params = {}, force = false) => {
    if (!force && isCacheValid('salaries') && !filtersChanged('salaries', params)) {
      setSalaries(cache.current.salaries.data);
      return;
    }

    if (cache.current.salaries.loading) return;

    cache.current.salaries.loading = true;
    setLoading(true);
    
    try {
      const { data } = await adminService.getSalaries(params);
      const salariesData = Array.isArray(data) ? data : data?.data?.salaries || [];
      setSalaries(salariesData);
      updateCache('salaries', salariesData, params);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salaries');
    } finally {
      setLoading(false);
      cache.current.salaries.loading = false;
    }
  }, []);

  const addSalary = useCallback(async (salaryData) => {
    try {
      setLoading(true);
      const { data } = await adminService.createSalary(salaryData);
      
      setSalaries(prev => [data, ...prev]);
      updateCache('salaries', [data, ...salaries], cache.current.salaries.filters);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add salary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [salaries]);

  const updateSalary = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const { data } = await adminService.updateSalary(id, updates);
      
      setSalaries(prev => prev.map(salary =>
        salary._id === id ? { ...salary, ...data } : salary
      ));
      updateCache('salaries', salaries.map(salary =>
        salary._id === id ? { ...salary, ...data } : salary
      ), cache.current.salaries.filters);
      
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [salaries]);

  // History-related functions
  const fetchDepartmentHistory = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await adminService.getDepartmentHistory(id);
      setDepartmentHistory(Array.isArray(data) ? data : data?.data?.history || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache function for manual cache invalidation
  const clearCache = useCallback((cacheKey = null) => {
    if (cacheKey) {
      cache.current[cacheKey] = { data: null, timestamp: null, loading: false, filters: null };
    } else {
      Object.keys(cache.current).forEach(key => {
        cache.current[key] = { data: null, timestamp: null, loading: false, filters: null };
      });
    }
  }, []);

  const value = {
    // State
    employees,
    allLeaves,
    employeeTasks,
    salaries,
    departments,
    duties,
    departmentHistory,
    loading,
    error,

    // Department functions
    fetchDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentAnalytics,

    // Employee functions
    fetchEmployees,
    getEmployee,
    getEmployeeDetails,
    assignEmployeeDuties,
    updateEmployeeStatus,
    changeEmployeeStatus,

    // Duty functions
    fetchDuties,
    createDuty,
    getDutyFormSchema,
    assignDepartmentAndDuties,
    updateDepartmentAndDuties,

    // Task functions
    fetchEmployeeTasks,
    reviewTask,
    getEmployeeTaskStats,

    // Leave functions
    fetchAllLeaves,
    getLeave,
    updateLeaveStatus,
    getLeaveAnalytics,
    getAdvancedLeaveAnalytics,

    // Salary functions
    fetchSalaries,
    addSalary,
    updateSalary,

    // History functions
    fetchDepartmentHistory,

    // Utility functions
    clearCache
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