import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { employeeService } from '../services/apiServices';

const EmployeeContext = createContext();

// Enhanced debounce utility with cleanup
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  // Save latest callback in ref
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]); // ← Only delay here
};


// Enhanced request deduplication with cache expiration
const createRequestDeduplicator = () => {
  const pendingRequests = new Map();
  const cacheExpiry = 30000; // 30 seconds cache
  
  return (key, requestFn) => {
    const now = Date.now();
    const cached = pendingRequests.get(key);
    
    if (cached && now - cached.timestamp < cacheExpiry) {
      return cached.promise;
    }
    
    const promise = requestFn()
      .finally(() => {
        // Keep in cache until expiry
        setTimeout(() => {
          pendingRequests.delete(key);
        }, cacheExpiry);
      });
    
    pendingRequests.set(key, { promise, timestamp: now });
    return promise;
  };
};

export const EmployeeProvider = ({ children }) => {
  // State management
  const [state, setState] = useState({
    tasks: [],
    leaves: [],
    departments: [],
    duties: [],
    myDuties: [],
    dutyHistory: [],
    salaryRecords: [],
    loading: false,
    error: null,
    loadingStates: {
      leaves: false,
      departments: false,
      duties: false,
      myDuties: false,
      dutyHistory: false,
      salaryRecords: false,
    }
  });

  // Request deduplication
  const requestDeduplicator = useRef(createRequestDeduplicator()).current;
  
  // State updaters
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateLoadingState = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      loadingStates: { ...prev.loadingStates, [key]: value }
    }));
  }, []);

  // Debounced error setter with cleanup
  const debouncedSetError = useDebounce((errorMsg) => {
    updateState({ error: errorMsg });
  }, 300);

  // API call wrapper with common error handling
  const apiCall = useCallback(async (serviceFn, options = {}) => {
    const {
      loadingKey,
      stateKey,
      force = false,
      transform = (d) => d,
      cacheKey
    } = options;

    if (!force && state.loadingStates[loadingKey]) return;

    try {
      if (loadingKey) updateLoadingState(loadingKey, true);
      updateState({ error: null });

      const response = await (cacheKey 
        ? requestDeduplicator(cacheKey, () => serviceFn())
        : serviceFn()
      );

      const data = transform(response.data);
      if (stateKey) updateState({ [stateKey]: data });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Request failed';
      debouncedSetError(errorMsg);
      throw err;
    } finally {
      if (loadingKey) updateLoadingState(loadingKey, false);
    }
  }, [state.loadingStates, requestDeduplicator, updateLoadingState, updateState, debouncedSetError]);

  // Profile operations
  const getProfile = useCallback(() => apiCall(
    () => employeeService.getProfile(),
    { loadingKey: 'profile' }
  ), [apiCall]);

  // Task operations
  const submitTask = useCallback(async (dutyId, formData, forceNew = false) => {
    return apiCall(
      () => employeeService.submitTask(dutyId, formData, forceNew),
      {
        transform: (data) => {
          updateState(prev => ({ tasks: [data.task, ...prev.tasks] }));
          return data.task;
        }
      }
    );
  }, [apiCall, updateState]);

  // Leave operations
  const fetchLeaves = useCallback((force = false) => apiCall(
    () => employeeService.getMyLeaves(),
    { loadingKey: 'leaves', stateKey: 'leaves', force, cacheKey: 'leaves' }
  ), [apiCall]);

  const applyLeave = useCallback((leaveData) => apiCall(
    () => employeeService.applyLeave(leaveData),
    {
      transform: (data) => {
        updateState(prev => ({ leaves: [data.leave, ...prev.leaves] }));
        return data.leave;
      }
    }
  ), [apiCall, updateState]);

  // Department operations
  const fetchDepartments = useCallback((force = false) => apiCall(
    () => employeeService.getDepartments(),
    { loadingKey: 'departments', stateKey: 'departments', force, cacheKey: 'departments' }
  ), [apiCall]);

  // Duty operations
  const fetchAllDuties = useCallback((force = false) => apiCall(
    () => employeeService.getAllDuties(),
    { loadingKey: 'duties', stateKey: 'duties', force, cacheKey: 'duties' }
  ), [apiCall]);

  
const fetchMyDuties = useCallback(
  (force = false) =>
    apiCall(
      () => employeeService.getMyDuties(),
      {
        loadingKey: 'myDuties',
        stateKey: 'myDuties',
        force,
        cacheKey: 'myDuties',
        transform: (response) => {
          // Handle both array and object responses
          const duties = Array.isArray(response) ? response : response?.data || [];

          return duties.map((duty) => ({
            ...duty,
            // Ensure consistent ID field
            id: duty._id ? duty._id.toString() : duty.id || '',
            // Ensure formSchema exists and is complete
            formSchema: duty.formSchema
              ? {
                  title: duty.formSchema.title || duty.title || 'Task Submission Form',
                  description: duty.formSchema.description || duty.description || '',
                  fields: Array.isArray(duty.formSchema.fields) ? duty.formSchema.fields : [],
                  submitButtonText: duty.formSchema.submitButtonText || 'Submit Task',
                  allowMultipleSubmissions: duty.formSchema.allowMultipleSubmissions ?? true,
                  submissionLimit: duty.formSchema.submissionLimit ?? null
                }
              : {
                  title: duty.title || 'Task Submission Form',
                  description: duty.description || '',
                  fields: [],
                  submitButtonText: 'Submit Task',
                  allowMultipleSubmissions: true,
                  submissionLimit: null
                },
            // Ensure department is an object with name
            department: duty.department
              ? {
                  _id: duty.department._id?.toString() || '',
                  name: duty.department.name || ''
                }
              : { _id: '', name: '' }
          }));
        },
        onError: (error) => {
          console.error('Failed to fetch duties:', error);
          return {
            error: true,
            message: error.message || 'Failed to fetch duties',
            status: error.status || 500
          };
        }
      }
    ),
  [apiCall]
);

  // History operations
  const fetchDutyHistory = useCallback((force = false) => apiCall(
    () => employeeService.getMyDutyHistory(),
    { loadingKey: 'dutyHistory', stateKey: 'dutyHistory', force, cacheKey: 'dutyHistory' }
  ), [apiCall]);

  // Salary operations
  const fetchSalaryRecords = useCallback((force = false) => apiCall(
    () => employeeService.getSalaryRecords(),
    { loadingKey: 'salaryRecords', stateKey: 'salaryRecords', force, cacheKey: 'salaryRecords' }
  ), [apiCall]);

  const downloadSalaryPDF = useCallback(async (salaryId = '') => {
    try {
      updateState({ error: null });
      const response = await employeeService.downloadSalaryPDF(salaryId);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salary-${salaryId || 'all'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to download salary PDF';
      debouncedSetError(errorMsg);
      throw err;
    }
  }, [debouncedSetError, updateState]);

  // Analytics operations
  const getLeaveAnalytics = useCallback((year) => apiCall(
    () => employeeService.getLeaveAnalytics(year),
    { loadingKey: 'leaves' }
  ), [apiCall]);

  // Resource bundling
  const fetchResources = useCallback(async (force = false) => {
    return apiCall(
      async () => {
        await fetchDepartments(force);
        await fetchAllDuties(force);
        return {
          departments: state.departments,
          duties: state.duties
        };
      },
      { loadingKey: 'resources', force, cacheKey: 'resources' }
    );
  }, [apiCall, fetchDepartments, fetchAllDuties, state.departments, state.duties]);

  // Clear all data
  const clearData = useCallback(() => {
    updateState({
      tasks: [],
      leaves: [],
      departments: [],
      duties: [],
      myDuties: [],
      dutyHistory: [],
      salaryRecords: [],
      error: null,
      loading: false,
      loadingStates: {
        leaves: false,
        departments: false,
        duties: false,
        myDuties: false,
        dutyHistory: false,
        salaryRecords: false,
      }
    });
  }, [updateState]);

  return (
    <EmployeeContext.Provider value={{
      ...state,
      getProfile,
      submitTask,
      fetchLeaves,
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
    }}>
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