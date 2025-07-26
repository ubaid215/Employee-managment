import { createContext, useContext, useState } from 'react';
import { adminService } from '../services/apiServices';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [departmentHistory, setDepartmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllEmployees();
      setEmployees(data.employees);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Get single employee details
  const getEmployeeDetails = async (employeeId) => {
    try {
      const { data } = await adminService.getEmployeeDetails(employeeId);
      return data.employee;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee details');
      throw err;
    }
  };

  // Create department
  const createDepartment = async (name) => {
    try {
      const { data } = await adminService.createDepartment(name);
      return data.department;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
      throw err;
    }
  };

  // Create duty
  const createDuty = async (dutyData) => {
    try {
      const { data } = await adminService.createDuty(dutyData);
      return data.duty;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create duty');
      throw err;
    }
  };

  // Assign department and duties
  const assignDepartment = async (userId, departmentId, dutyIds, reason) => {
    try {
      const { data } = await adminService.assignDepartmentAndDuties(
        userId,
        departmentId,
        dutyIds,
        reason
      );
      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp._id === userId
            ? { ...emp, department: data.department, duties: data.duties }
            : emp
        )
      );
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
      throw err;
    }
  };

  // Change employee status
  const changeEmployeeStatus = async (userId, status) => {
    try {
      const { data } = await adminService.changeEmployeeStatus(userId, status);
      setEmployees(prev =>
        prev.map(emp =>
          emp._id === userId ? { ...emp, status: status } : emp
        )
      );
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Status change failed');
      throw err;
    }
  };

  // Fetch employee tasks
  const fetchEmployeeTasks = async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await adminService.getEmployeeTasks(filters);
      setEmployeeTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee tasks');
    } finally {
      setLoading(false);
    }
  };

  // Review task
  const reviewTask = async (taskId, status, feedback) => {
    try {
      const { data } = await adminService.reviewTask(taskId, status, feedback);
      setEmployeeTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, ...data.task } : task
        )
      );
      return data.task;
    } catch (err) {
      setError(err.response?.data?.message || 'Task review failed');
      throw err;
    }
  };

  // Get employee task stats
  const getEmployeeTaskStats = async (employeeId) => {
    try {
      const { data } = await adminService.getEmployeeTaskStats(employeeId);
      return data.stats;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch task stats');
      throw err;
    }
  };

  // Fetch all leaves
  const fetchAllLeaves = async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllLeaves(filters);
      setAllLeaves(data.leaves);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  // Get leave details
  const getLeaveDetails = async (leaveId) => {
    try {
      const { data } = await adminService.getLeaveDetails(leaveId);
      return data.leave;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave details');
      throw err;
    }
  };

  // Approve/reject leave
  const processLeave = async (leaveId, decision) => {
    try {
      const { data } = await adminService.approveLeave(leaveId, decision);
      setAllLeaves(prev =>
        prev.map(leave =>
          leave._id === leaveId ? { ...leave, ...data.leave } : leave
        )
      );
      return data.leave;
    } catch (err) {
      setError(err.response?.data?.message || 'Leave processing failed');
      throw err;
    }
  };

  // Get leave analytics
  const getLeaveAnalytics = async () => {
    try {
      const { data } = await adminService.getLeaveAnalytics();
      return data.analytics;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave analytics');
      throw err;
    }
  };

  // Get advanced leave analytics
  const getAdvancedLeaveAnalytics = async (filters = {}) => {
    try {
      const { data } = await adminService.getAdvancedLeaveAnalytics(filters);
      return data.analytics;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advanced analytics');
      throw err;
    }
  };

  // Fetch department history
  const fetchDepartmentHistory = async (departmentId) => {
    setLoading(true);
    try {
      const { data } = await adminService.getDepartmentHistory(departmentId);
      setDepartmentHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch salaries
  const fetchSalaries = async (filters = {}) => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllSalaries(filters);
      setSalaries(data.salaries);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  // Add salary
  const addSalary = async (salaryData) => {
    try {
      const { data } = await adminService.addSalary(salaryData);
      setSalaries(prev => [data.salary, ...prev]);
      return data.salary;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add salary');
      throw err;
    }
  };

  // Update salary
  const updateSalary = async (salaryId, updates) => {
    try {
      const { data } = await adminService.updateSalary(salaryId, updates);
      setSalaries(prev =>
        prev.map(salary =>
          salary._id === salaryId ? { ...salary, ...data.salary } : salary
        )
      );
      return data.salary;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salary');
      throw err;
    }
  };

  const value = {
    employees,
    allLeaves,
    employeeTasks,
    salaries,
    departmentHistory,
    loading,
    error,
    fetchEmployees,
    getEmployeeDetails,
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
    updateSalary
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