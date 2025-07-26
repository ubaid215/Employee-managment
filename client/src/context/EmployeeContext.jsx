import { createContext, useContext, useState } from 'react';
import { employeeService } from '../services/apiServices';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [duties, setDuties] = useState([]);
  const [myDuties, setMyDuties] = useState([]);
  const [dutyHistory, setDutyHistory] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employee leaves
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getMyLeaves();
      setLeaves(data.leaves);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  // Submit new task
  const submitTask = async (dutyId, formData) => {
    try {
      const { data } = await employeeService.submitTask(dutyId, formData);
      setTasks(prev => [data.task, ...prev]);
      return data.task;
    } catch (err) {
      setError(err.response?.data?.message || 'Task submission failed');
      throw err;
    }
  };

  // Update existing task
  const updateTask = async (taskId, formData) => {
    try {
      const { data } = await employeeService.updateTask(taskId, formData);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? data.task : task
      ));
      return data.task;
    } catch (err) {
      setError(err.response?.data?.message || 'Task update failed');
      throw err;
    }
  };

  // Apply for leave
  const applyLeave = async (leaveData) => {
    try {
      const { data } = await employeeService.applyLeave(leaveData);
      setLeaves(prev => [data.leave, ...prev]);
      return data.leave;
    } catch (err) {
      setError(err.response?.data?.message || 'Leave application failed');
      throw err;
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getDepartments();
      setDepartments(data.departments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all duties
  const fetchAllDuties = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getAllDuties();
      setDuties(data.duties);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch duties');
    } finally {
      setLoading(false);
    }
  };

  // Fetch my assigned duties
  const fetchMyDuties = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getMyDuties();
      setMyDuties(data.duties);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch my duties');
    } finally {
      setLoading(false);
    }
  };

  // Fetch duty history
  const fetchDutyHistory = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getMyDutyHistory();
      setDutyHistory(data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch duty history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch salary records
  const fetchSalaryRecords = async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.getSalaryRecords();
      setSalaryRecords(data.salaries);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salary records');
    } finally {
      setLoading(false);
    }
  };

  // Download salary PDF
  const downloadSalaryPDF = async (salaryId) => {
    try {
      const response = await employeeService.downloadSalaryPDF(salaryId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salary-${salaryId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download salary PDF');
      throw err;
    }
  };

  // Get leave analytics
  const getLeaveAnalytics = async () => {
    try {
      const { data } = await employeeService.getLeaveAnalytics();
      return data.analytics;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave analytics');
      throw err;
    }
  };

  // Fetch departments and duties together
  const fetchResources = async () => {
    setLoading(true);
    try {
      const [deptsResponse, dutiesResponse] = await Promise.all([
        employeeService.getDepartments(),
        employeeService.getAllDuties()
      ]);
      setDepartments(deptsResponse.data.departments);
      setDuties(dutiesResponse.data.duties);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    leaves,
    departments,
    duties,
    myDuties,
    dutyHistory,
    salaryRecords,
    loading,
    error,
    fetchLeaves,
    submitTask,
    updateTask,
    applyLeave,
    fetchDepartments,
    fetchAllDuties,
    fetchMyDuties,
    fetchDutyHistory,
    fetchSalaryRecords,
    downloadSalaryPDF,
    getLeaveAnalytics,
    fetchResources
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};