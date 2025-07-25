import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getSalaries, 
  addSalary, 
  updateSalary,
  downloadSalaryPDF, 
  downloadAllSalariesPDF 
} from '../services/salaryService';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { useSocket } from './SocketContext';

const SalaryContext = createContext();

export const SalaryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const { socket } = useSocket();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Fetch salary records with filters
  const fetchSalaries = async (newFilters = {}) => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      // For employees, we don't want to pass any employeeId filter
      const effectiveFilters = user.role === 'admin' ? 
        { ...filters, ...newFilters } : 
        { ...newFilters };
      
      const data = await getSalaries(effectiveFilters);
      setSalaries(data);
      setFilters(effectiveFilters);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when user changes
  useEffect(() => {
    fetchSalaries();
  }, [isAuthenticated, user]);

  // Add salary (admin only)
  const addSalaryRecord = async (salaryData) => {
    if (user?.role !== 'admin') {
      const err = new Error('Only admins can add salary records');
      setError(err.message);
      throw err;
    }

    try {
      const response = await addSalary(salaryData);
      setSalaries(prev => [response.salary, ...prev]);
      
      // Notify the employee via socket
      if (socket) {
        socket.emit('salary-added', response.salary);
      }
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update salary (admin only)
  const updateSalaryRecord = async (salaryId, updates) => {
    if (user?.role !== 'admin') {
      const err = new Error('Only admins can update salary records');
      setError(err.message);
      throw err;
    }

    try {
      const response = await updateSalary(salaryId, updates);
      setSalaries(prev => 
        prev.map(salary => 
          salary._id === salaryId ? response.salary : salary
        )
      );
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Download salary PDF
  const downloadSalarySlip = async (salaryId) => {
    try {
      return await downloadSalaryPDF(salaryId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Download all salaries PDF (admin only)
  const downloadAllSalariesReport = async () => {
    if (user?.role !== 'admin') {
      const err = new Error('Only admins can download all salaries');
      setError(err.message);
      throw err;
    }

    try {
      return await downloadAllSalariesPDF(filters);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen for salary-added WebSocket event
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewSalary = (salary) => {
      if (user.role === 'employee' && salary.employee === user._id) {
        setSalaries(prev => [salary, ...prev]);
      }
    };

    socket.on('salary-added', handleNewSalary);
    return () => socket.off('salary-added', handleNewSalary);
  }, [socket, user]);

  // Clear error
  const clearError = () => setError(null);

  return (
    <SalaryContext.Provider
      value={{
        // State
        salaries,
        loading,
        error,
        filters,

        // Actions
        fetchSalaries,
        addSalary: addSalaryRecord,
        updateSalary: updateSalaryRecord,
        downloadSalaryPDF: downloadSalarySlip,
        downloadAllSalariesPDF: downloadAllSalariesReport,
        setFilters,
        clearError
      }}
    >
      {children}
    </SalaryContext.Provider>
  );
};

export const useSalary = () => useContext(SalaryContext);