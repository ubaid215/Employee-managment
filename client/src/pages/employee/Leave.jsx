import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, Send, 
  Loader2, History, Plus,
  Bell, X, CalendarDays
} from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  const { 
    leaves = [], 
    fetchLeaves, 
    applyLeave, 
    loading 
  } = useEmployee();
  
  const [formData, setFormData] = useState({
    reason: '',
    fromDate: '',
    toDate: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [socket, setSocket] = useState(null);
  const [newStatusUpdates, setNewStatusUpdates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Memoize the fetch function to prevent unnecessary re-renders
  const memoizedFetchLeaves = useCallback(() => {
    if (fetchLeaves && typeof fetchLeaves === 'function') {
      fetchLeaves();
    }
  }, [fetchLeaves]);

  useEffect(() => {
    // Only fetch leaves once when component mounts
    let mounted = true;
    
    if (mounted) {
      memoizedFetchLeaves();
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Initialize socket connection only if user exists
    if (!user?._id) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket']
    });
    
    setSocket(newSocket);

    // Listen for leave status updates
    newSocket.on('leaveStatusUpdate', (update) => {
      if (update.employeeId === user._id) {
        setNewStatusUpdates(prev => [...prev, update]);
        // Refresh leaves list after a small delay to ensure backend is updated
        setTimeout(() => {
          memoizedFetchLeaves();
        }, 500);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, memoizedFetchLeaves]);

  useEffect(() => {
    // Clear notifications after 5 seconds
    if (newStatusUpdates.length === 0) return;
    
    const timer = setTimeout(() => {
      setNewStatusUpdates([]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [newStatusUpdates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required';
      isValid = false;
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Please provide a more detailed reason (minimum 10 characters)';
      isValid = false;
    } else if (formData.reason.trim().length > 500) {
      errors.reason = 'Reason cannot exceed 500 characters';
      isValid = false;
    }

    if (!formData.fromDate) {
      errors.fromDate = 'Start date is required';
      isValid = false;
    } else {
      const fromDate = new Date(formData.fromDate);
      if (fromDate < today) {
        errors.fromDate = 'Start date cannot be in the past';
        isValid = false;
      }
    }

    if (!formData.toDate) {
      errors.toDate = 'End date is required';
      isValid = false;
    } else if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      errors.toDate = 'End date must be after start date';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || submitting) return;

    setSubmitting(true);
    try {
      await applyLeave({
        reason: formData.reason.trim(),
        fromDate: formData.fromDate,
        toDate: formData.toDate
      });
      
      // Reset form on successful submission
      setFormData({
        reason: '',
        fromDate: '',
        toDate: ''
      });
      setValidationErrors({});
      
      // Show success notification
      setNewStatusUpdates(prev => [...prev, {
        type: 'success',
        message: 'Leave application submitted successfully!',
        fromDate: formData.fromDate,
        toDate: formData.toDate
      }]);
      
    } catch (err) {
      console.error('Leave application failed:', err);
      setValidationErrors({ 
        submit: err.response?.data?.message || 'Failed to submit leave application. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dismissNotification = (index) => {
    setNewStatusUpdates(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors";
    
    switch(status) {
      case 'approved':
        return `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={14} className="mr-1.5" />;
      case 'rejected':
        return <XCircle size={14} className="mr-1.5" />;
      case 'pending':
        return <Clock size={14} className="mr-1.5" />;
      default:
        return null;
    }
  };

  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    const options = { month: 'short', day: 'numeric' };
    
    if (fromDate.getMonth() === toDate.getMonth() && fromDate.getFullYear() === toDate.getFullYear()) {
      return `${fromDate.getDate()} - ${toDate.getDate()} ${fromDate.toLocaleString('default', { month: 'short' })} ${fromDate.getFullYear()}`;
    }
    return `${fromDate.toLocaleDateString('en-US', options)} - ${toDate.toLocaleDateString('en-US', options)} ${toDate.getFullYear()}`;
  };

  const calculateDays = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  // Memoize sorted leaves to prevent unnecessary recalculations
  const sortedLeaves = useMemo(() => {
    if (!Array.isArray(leaves)) return [];
    return [...leaves].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }, [leaves]);

  const leaveStats = useMemo(() => {
    if (!Array.isArray(leaves)) return { total: 0, approved: 0, pending: 0, rejected: 0 };
    
    return leaves.reduce((stats, leave) => {
      stats.total++;
      stats[leave.status] = (stats[leave.status] || 0) + 1;
      return stats;
    }, { total: 0, approved: 0, pending: 0, rejected: 0 });
  }, [leaves]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification Toast */}
        {newStatusUpdates.length > 0 && (
          <div className="mb-6 space-y-3">
            {newStatusUpdates.map((update, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-xl shadow-lg p-4 backdrop-blur-sm border-l-4 ${
                  update.type === 'success' 
                    ? 'bg-blue-50 border-blue-500' 
                    : update.status === 'approved' 
                      ? 'bg-emerald-50 border-emerald-500' 
                      : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Bell className={`w-5 h-5 ${
                        update.type === 'success' 
                          ? 'text-blue-500' 
                          : update.status === 'approved' 
                            ? 'text-emerald-500' 
                            : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Leave Status Update</h3>
                      {update.type === 'success' ? (
                        <p className="text-sm text-gray-700">
                          Your leave application has been submitted successfully!
                        </p>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-700">
                            Your leave for {formatDateRange(update.fromDate, update.toDate)} has been{' '}
                            <span className={`font-medium ${
                              update.status === 'approved' 
                                ? 'text-emerald-600' 
                                : 'text-red-600'
                            }`}>
                              {update.status}
                            </span>
                          </p>
                          {update.rejectionReason && (
                            <p className="text-xs text-gray-600 mt-1 bg-white/50 p-2 rounded">
                              <strong>Reason:</strong> {update.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNotification(idx)}
                    className="flex-shrink-0 p-1 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100/50 rounded-lg">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{leaveStats.total}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/50 rounded-lg">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{leaveStats.approved || 0}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100/50 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{leaveStats.pending || 0}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100/50 rounded-lg">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{leaveStats.rejected || 0}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/50 sticky top-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100/50 rounded-lg">
                  <Plus size={20} className="text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Apply for Leave
                </span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leave <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      validationErrors.reason ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                    }`}
                    placeholder="Please provide a detailed reason for your leave request..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {validationErrors.reason ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {validationErrors.reason}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">Minimum 10 characters</span>
                    )}
                    <span className={`text-xs ${
                      formData.reason.length > 500 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {formData.reason.length}/500
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          validationErrors.fromDate ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    {validationErrors.fromDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {validationErrors.fromDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        min={formData.fromDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          validationErrors.toDate ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                    {validationErrors.toDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {validationErrors.toDate}
                      </p>
                    )}
                  </div>
                </div>

                {validationErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {validationErrors.submit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Leave History */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-gray-200/50 hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-blue-100/50 rounded-lg">
                    <History size={20} className="text-blue-600" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Leave History
                  </span>
                </h2>
              </div>

              {loading && sortedLeaves.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading your leave history...</p>
                </div>
              ) : sortedLeaves.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave records found</h3>
                  <p className="text-gray-500">Your leave applications will appear here once you submit them.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Period
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/50">
                      {sortedLeaves.map((leave, index) => (
                        <tr key={leave._id} className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <CalendarDays size={16} className="text-gray-400 flex-shrink-0" />
                              <div className="text-sm font-medium text-gray-900">
                                {formatDateRange(leave.fromDate, leave.toDate)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {calculateDays(leave.fromDate, leave.toDate)} day{calculateDays(leave.fromDate, leave.toDate) !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                              {leave.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-2">
                              <span className={getStatusBadge(leave.status)}>
                                {getStatusIcon(leave.status)}
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                              {leave.rejectionReason && (
                                <div className="text-xs text-gray-600 mt-1 p-2 bg-red-50/50 rounded border-l-2 border-red-200">
                                  <strong>Note:</strong> {leave.rejectionReason}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(leave.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;