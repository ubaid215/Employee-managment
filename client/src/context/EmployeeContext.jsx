import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { employeeService } from '../services/apiServices';

const EmployeeContext = createContext();

// Debounce utility
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Request deduplication utility
const createRequestDeduplicator = () => {
  const pendingRequests = new Map();
  
  return (key, requestFn) => {
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    
    const promise = requestFn()
      .finally(() => {
        pendingRequests.delete(key);
      });
    
    pendingRequests.set(key, promise);
    return promise;
  };
};

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
  
  // Request deduplication
  const requestDeduplicator = useRef(createRequestDeduplicator()).current;
  
  // Loading states for individual operations
  const [loadingStates, setLoadingStates] = useState({
    leaves: false,
    departments: false,
    duties: false,
    myDuties: false,
    dutyHistory: false,
    salaryRecords: false,
  });

  // Generic loading state updater
  const updateLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Debounced error setter
  const debouncedSetError = useDebounce((errorMsg) => {
    setError(errorMsg);
  }, 300);

  // Fetch employee leaves with deduplication
  const fetchLeaves = useCallback(async (force = false) => {
    const cacheKey = 'fetchLeaves';
    
    if (!force && loadingStates.leaves) return;
    
    return requestDeduplicator(cacheKey, async () => {
      updateLoadingState('leaves', true);
      setError(null);
      
      try {
        const { data } = await employeeService.getMyLeaves();
        setLeaves(data.leaves);
        return data.leaves;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch leaves';
        debouncedSetError(errorMsg);
        throw err;
      } finally {
        updateLoadingState('leaves', false);
      }
    });
  }, [loadingStates.leaves, requestDeduplicator, debouncedSetError]);

  // Submit new task
  const submitTask = useCallback(async (dutyId, formData) => {
    try {
      setError(null);
      const { data } = await employeeService.submitTask(dutyId, formData);
      setTasks(prev => [data.task, ...prev]);
      return data.task;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Task submission failed';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Update existing task
  const updateTask = useCallback(async (taskId, formData) => {
    try {
      setError(null);
      const { data } = await employeeService.updateTask(taskId, formData);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? data.task : task
      ));
      return data.task;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Task update failed';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Apply for leave
  const applyLeave = useCallback(async (leaveData) => {
    try {
      setError(null);
      const { data } = await employeeService.applyLeave(leaveData);
      setLeaves(prev => [data.leave, ...prev]);
      return data.leave;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Leave application failed';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Fetch departments with deduplication
  const fetchDepartments = useCallback(async (force = false) => {
    const cacheKey = 'fetchDepartments';
    
    if (!force && loadingStates.departments) return;
    
    return requestDeduplicator(cacheKey, async () => {
      updateLoadingState('departments', true);
      setError(null);
      
      try {
        const { data } = await employeeService.getDepartments();
        setDepartments(data.departments);
        return data.departments;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch departments';
        debouncedSetError(errorMsg);
        throw err;
      } finally {
        updateLoadingState('departments', false);
      }
    });
  }, [loadingStates.departments, requestDeduplicator, debouncedSetError]);

  // Fetch all duties with deduplication
  const fetchAllDuties = useCallback(async (force = false) => {
    const cacheKey = 'fetchAllDuties';
    
    if (!force && loadingStates.duties) return;
    
    return requestDeduplicator(cacheKey, async () => {
      updateLoadingState('duties', true);
      setError(null);
      
      try {
        const { data } = await employeeService.getAllDuties();
        setDuties(data.duties);
        return data.duties;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch duties';
        debouncedSetError(errorMsg);
        throw err;
      } finally {
        updateLoadingState('duties', false);
      }
    });
  }, [loadingStates.duties, requestDeduplicator, debouncedSetError]);

  // Fetch my assigned duties
const fetchMyDuties = useCallback(async (force = false) => {
  const cacheKey = 'fetchMyDuties';
  
  if (!force && loadingStates.myDuties) return;
  
  return requestDeduplicator(cacheKey, async () => {
    updateLoadingState('my-duties', true);
    setError(null);
    
    try {
      const { data } = await employeeService.getMyDuties();
      
      // Add debug log to check API response
      console.log('API Response - My Duties:', data);
      
      // Ensure we're handling both array and object responses
      const duties = Array.isArray(data) ? data : 
                    data?.duties ? data.duties : 
                    data?.data ? data.data : [];
      
      setMyDuties(duties);
      return duties;
    } catch (err) {
      console.error('Full error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.message || 
                      'Failed to fetch duties';
      debouncedSetError(errorMsg);
      throw err;
    } finally {
      updateLoadingState('my-duties', false);
    }
  });
}, [loadingStates.myDuties, requestDeduplicator, debouncedSetError]);

  // Fetch duty history
  const fetchDutyHistory = useCallback(async (force = false) => {
    const cacheKey = 'fetchDutyHistory';
    
    if (!force && loadingStates.dutyHistory) return;
    
    return requestDeduplicator(cacheKey, async () => {
      updateLoadingState('dutyHistory', true);
      setError(null);
      
      try {
        const { data } = await employeeService.getMyDutyHistory();
        setDutyHistory(data.history);
        return data.history;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch duty history';
        debouncedSetError(errorMsg);
        throw err;
      } finally {
        updateLoadingState('dutyHistory', false);
      }
    });
  }, [loadingStates.dutyHistory, requestDeduplicator, debouncedSetError]);

  // Fetch salary records
  const fetchSalaryRecords = useCallback(async (force = false) => {
    const cacheKey = 'fetchSalaryRecords';
    
    if (!force && loadingStates.salaryRecords) return;
    
    return requestDeduplicator(cacheKey, async () => {
      updateLoadingState('salaryRecords', true);
      setError(null);
      
      try {
        const { data } = await employeeService.getSalaryRecords();
        setSalaryRecords(data.salaries);
        return data.salaries;
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch salary records';
        debouncedSetError(errorMsg);
        throw err;
      } finally {
        updateLoadingState('salaryRecords', false);
      }
    });
  }, [loadingStates.salaryRecords, requestDeduplicator, debouncedSetError]);

  // Download salary PDF
  const downloadSalaryPDF = useCallback(async (salaryId) => {
    try {
      setError(null);
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
      const errorMsg = err.response?.data?.message || 'Failed to download salary PDF';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Get leave analytics
  const getLeaveAnalytics = useCallback(async () => {
    try {
      setError(null);
      const { data } = await employeeService.getLeaveAnalytics();
      return data.analytics;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch leave analytics';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Improved fetchResources with sequential requests and better error handling
  const fetchResources = useCallback(async (force = false) => {
    const cacheKey = 'fetchResources';
    
    return requestDeduplicator(cacheKey, async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch departments first
        await fetchDepartments(force);
        
        // Small delay before next request to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Then fetch duties
        await fetchAllDuties(force);
        
        return { departments, duties };
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch resources';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    });
  }, [fetchDepartments, fetchAllDuties, departments, duties, requestDeduplicator]);

  // Clear all data (useful for logout)
  const clearData = useCallback(() => {
    setTasks([]);
    setLeaves([]);
    setDepartments([]);
    setDuties([]);
    setMyDuties([]);
    setDutyHistory([]);
    setSalaryRecords([]);
    setError(null);
    setLoading(false);
    setLoadingStates({
      leaves: false,
      departments: false,
      duties: false,
      myDuties: false,
      dutyHistory: false,
      salaryRecords: false,
    });
  }, []);

  const value = {
    tasks,
    leaves,
    departments,
    duties,
    myDuties,
    dutyHistory,
    salaryRecords,
    loading,
    loadingStates,
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
    fetchResources,
    clearData
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