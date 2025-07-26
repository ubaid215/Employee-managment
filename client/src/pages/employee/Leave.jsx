import { useState, useEffect } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { 
  Calendar, Clock, AlertCircle, 
  CheckCircle, XCircle, Send, 
  Loader2, History, Plus 
} from 'lucide-react';

const Leave = () => {
  const { user } = useAuth();
  const { 
    leaves, 
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

  useEffect(() => {
    fetchLeaves();
    
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ['websocket']
    });
    
    setSocket(newSocket);

    // Listen for leave status updates
    newSocket.on('leaveStatusUpdate', (update) => {
      if (update.employeeId === user._id) {
        setNewStatusUpdates(prev => [...prev, update]);
        fetchLeaves(); // Refresh leaves list
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchLeaves, user?._id]);

  useEffect(() => {
    // Clear notifications after 5 seconds
    const timer = setTimeout(() => {
      setNewStatusUpdates([]);
    }, 5000);

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

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required';
      isValid = false;
    }

    if (!formData.fromDate) {
      errors.fromDate = 'Start date is required';
      isValid = false;
    } else if (new Date(formData.fromDate) < new Date()) {
      errors.fromDate = 'Start date must be in the future';
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
    
    if (!validateForm()) return;

    try {
      await applyLeave({
        reason: formData.reason,
        fromDate: formData.fromDate,
        toDate: formData.toDate
      });
      
      setFormData({
        reason: '',
        fromDate: '',
        toDate: ''
      });
    } catch (err) {
      console.error('Leave application failed:', err);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={14} className="mr-1" />;
      case 'rejected':
        return <XCircle size={14} className="mr-1" />;
      case 'pending':
        return <Clock size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate.getMonth() === toDate.getMonth()) {
      return `${fromDate.getDate()} - ${toDate.getDate()} ${fromDate.toLocaleString('default', { month: 'short' })}`;
    }
    return `${fromDate.getDate()} ${fromDate.toLocaleString('default', { month: 'short' })} - ${toDate.getDate()} ${toDate.toLocaleString('default', { month: 'short' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Notification Toast */}
        {newStatusUpdates.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <h3 className="font-medium text-gray-900 mb-2">Leave Status Updates</h3>
            <ul className="space-y-2">
              {newStatusUpdates.map((update, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {update.status === 'approved' ? (
                    <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm">
                      Your leave for {formatDateRange(update.fromDate, update.toDate)} has been {update.status}
                    </p>
                    {update.rejectionReason && (
                      <p className="text-xs text-gray-500 mt-1">Reason: {update.rejectionReason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Leave Application Form */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" />
                Apply for Leave
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Briefly explain the reason for your leave"
                  />
                  {validationErrors.reason && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.reason}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.fromDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                    {validationErrors.fromDate && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.fromDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        min={formData.fromDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.toDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                    {validationErrors.toDate && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.toDate}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  Submit Leave Request
                </button>
              </form>
            </div>
          </div>

          {/* Leave History */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <History size={20} className="text-blue-500" />
                  My Leave History
                </h2>
              </div>

              {loading && !leaves.length ? (
                <div className="p-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : leaves.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
                  <p>No leave records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDateRange(leave.fromDate, leave.toDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(leave.fromDate).getFullYear()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {Math.ceil((new Date(leave.toDate) - new Date(leave.fromDate)) / (1000 * 60 * 60 * 24)) + 1} days
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                              {leave.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(leave.status)}>
                              {getStatusIcon(leave.status)}
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                            {leave.rejectionReason && (
                              <div className="text-xs text-gray-500 mt-1">
                                {leave.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(leave.appliedAt).toLocaleDateString()}
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