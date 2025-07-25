import { createContext, useContext, useState } from 'react';
import * as dutyService from '../services/dutyService';

const DutyContext = createContext();

export const DutyProvider = ({ children }) => {
  const [duties, setDuties] = useState([]);
  const [allDuties, setAllDuties] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get assigned duties
  const fetchDuties = async () => {
    setLoading(true);
    try {
      const dutiesData = await dutyService.getDuties();
      setDuties(dutiesData);
      return dutiesData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all duties (admin)
  const fetchAllDuties = async () => {
    setLoading(true);
    try {
      const dutiesData = await dutyService.getAllDuties();
      setAllDuties(dutiesData);
      return dutiesData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit task
  const submitTask = async (dutyId, formData) => {
    setLoading(true);
    try {
      const response = await dutyService.submitTask(dutyId, formData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get task logs (admin)
  const fetchTaskLogs = async (filters = {}) => {
    setLoading(true);
    try {
      const logs = await dutyService.getTaskLogs(filters);
      setTaskLogs(logs);
      return logs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Review task (admin)
  const reviewTask = async (taskId, status, feedback) => {
    setLoading(true);
    try {
      const response = await dutyService.reviewTask(taskId, status, feedback);
      // Refresh task logs after review
      await fetchTaskLogs();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get task stats (admin)
  const getTaskStats = async (employeeId) => {
    setLoading(true);
    try {
      return await dutyService.getTaskStats(employeeId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <DutyContext.Provider
      value={{
        // State
        duties,
        allDuties,
        taskLogs,
        loading,
        error,

        // Methods
        fetchDuties,
        fetchAllDuties,
        submitTask,
        fetchTaskLogs,
        reviewTask,
        getTaskStats,
        clearError,
      }}
    >
      {children}
    </DutyContext.Provider>
  );
};

export const useDuty = () => useContext(DutyContext);