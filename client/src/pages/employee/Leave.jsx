import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, Send, 
  Loader2, History, Plus,
  Bell, X, CalendarDays,
  ChevronDown, ChevronRight
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

  const memoizedFetchLeaves = useCallback(() => {
    if (fetchLeaves && typeof fetchLeaves === 'function') {
      fetchLeaves();
    }
  }, [fetchLeaves]);

  useEffect(() => {
    let mounted = true;
    if (mounted) memoizedFetchLeaves();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket']
    });
    
    setSocket(newSocket);

    newSocket.on('leaveStatusUpdate', (update) => {
      if (update.employeeId === user._id) {
        setNewStatusUpdates(prev => [...prev, update]);
        setTimeout(() => memoizedFetchLeaves(), 500);
      }
    });

    return () => newSocket.disconnect();
  }, [user?._id, memoizedFetchLeaves]);

  useEffect(() => {
    if (newStatusUpdates.length === 0) return;
    const timer = setTimeout(() => setNewStatusUpdates([]), 5000);
    return () => clearTimeout(timer);
  }, [newStatusUpdates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    } else if (new Date(formData.fromDate) < today) {
      errors.fromDate = 'Start date cannot be in the past';
      isValid = false;
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
      
      setFormData({ reason: '', fromDate: '', toDate: '' });
      setValidationErrors({});
      
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
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'approved':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={14} className="mr-1.5 text-emerald-500" />;
      case 'rejected':
        return <XCircle size={14} className="mr-1.5 text-red-500" />;
      case 'pending':
        return <Clock size={14} className="mr-1.5 text-amber-500" />;
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

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
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{leaveStats.total}</div>
                <div className="text-sm text-slate-600">Total Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-lg">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{leaveStats.approved || 0}</div>
                <div className="text-sm text-slate-600">Approved</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{leaveStats.pending || 0}</div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-100 to-red-50 rounded-lg">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{leaveStats.rejected || 0}</div>
                <div className="text-sm text-slate-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm sticky top-6 hover:shadow-xl transition-all">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Plus size={20} className="text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Apply for Leave
                </span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for Leave <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      validationErrors.reason ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
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
                      <span className="text-xs text-slate-400">Minimum 10 characters</span>
                    )}
                    <span className={`text-xs ${
                      formData.reason.length > 500 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {formData.reason.length}/500
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                          validationErrors.fromDate ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    {validationErrors.fromDate && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {validationErrors.fromDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                          validationErrors.toDate ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
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
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
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
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <History size={20} className="text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Leave History
                  </span>
                </h2>
              </div>

              {loading && sortedLeaves.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-slate-400 mb-4" />
                  <p className="text-slate-500">Loading your leave history...</p>
                </div>
              ) : sortedLeaves.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No leave records found</h3>
                  <p className="text-slate-500">Your leave applications will appear here once you submit them.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sortedLeaves.map((leave) => (
                    <div key={leave._id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar size={16} className="text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-slate-500">
                              {new Date(leave.appliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <div className="hidden md:block">
                              <span className={getStatusBadge(leave.status)}>
                                {getStatusIcon(leave.status)}
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="text-base font-medium text-slate-800">
                            {formatDateRange(leave.fromDate, leave.toDate)} • {calculateDays(leave.fromDate, leave.toDate)} day{calculateDays(leave.fromDate, leave.toDate) !== 1 ? 's' : ''}
                          </h4>
                          
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {leave.reason}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="md:hidden">
                            <span className={getStatusBadge(leave.status)}>
                              {getStatusIcon(leave.status)}
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </div>
                          
                          {leave.rejectionReason && (
                            <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                              <span>View Note</span>
                              <ChevronDown size={14} />
                            </button>
                          )}
                          
                          <button className="text-slate-400 hover:text-slate-600">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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