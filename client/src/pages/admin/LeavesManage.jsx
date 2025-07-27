import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Calendar, Clock, User, Check, X, 
  ChevronLeft, ChevronRight, Loader2, Filter,
  AlertCircle, Clock as PendingIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const LeavesManage = () => {
  const { 
    allLeaves, 
    fetchAllLeaves, 
    processLeave,
    employees,
    fetchEmployees,
    loading,
    error 
  } = useAdmin();

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filters, setFilters] = useState({
    status: '',
    employee: '',
    month: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchEmployees();
    fetchAllLeaves();
  }, []);

  // Filter leaves based on selected filters
  const filteredLeaves = allLeaves.filter(leave => {
    return (
      (filters.status === '' || leave.status === filters.status) &&
      (filters.employee === '' || leave.employee._id === filters.employee) &&
      (filters.month === '' || format(parseISO(leave.fromDate), 'MMMM yyyy') === filters.month)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  // Handle leave approval/rejection
  const handleLeaveAction = async (leaveId, action) => {
    try {
      await processLeave(leaveId, { status: action });
    } catch (err) {
      console.error('Failed to process leave:', err);
    }
  };

  // Generate month options for filter
  const generateMonthOptions = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      months.push(format(date, 'MMMM yyyy'));
    }
    
    return months;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit";
    
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    const statusIcons = {
      pending: <PendingIcon size={12} />,
      approved: <Check size={12} />,
      rejected: <X size={12} />
    };
    
    return (
      <span className={`${baseClasses} ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter size={18} className="text-blue-500" />
              Filters
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              {/* Employee Filter */}
              <select
                value={filters.employee}
                onChange={(e) => setFilters({...filters, employee: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
              
              {/* Month Filter */}
              <select
                value={filters.month}
                onChange={(e) => setFilters({...filters, month: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Months</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Leaves Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700">
            <div className="col-span-3 md:col-span-2">Employee</div>
            <div className="col-span-4 md:col-span-2">Leave Period</div>
            <div className="hidden md:block md:col-span-2">Days</div>
            <div className="hidden md:block md:col-span-3">Reason</div>
            <div className="col-span-3 md:col-span-1">Status</div>
            <div className="col-span-2 md:col-span-2">Actions</div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="p-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-4 flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          {/* Leaves List */}
          {!loading && currentLeaves.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leaves found matching your filters
            </div>
          ) : (
            currentLeaves.map(leave => (
              <div 
                key={leave._id} 
                className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Employee */}
                <div className="col-span-3 md:col-span-2 flex items-center gap-2">
                  <div className="hidden sm:flex h-8 w-8 bg-blue-100 rounded-full items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 line-clamp-1">
                      {leave.employee?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {leave.employee?.employeeId || 'N/A'}
                    </div>
                  </div>
                </div>
                
                {/* Leave Period */}
                <div className="col-span-4 md:col-span-2 flex flex-col">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    {format(parseISO(leave.fromDate), 'MMM dd')}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={14} className="text-gray-400" />
                    {format(parseISO(leave.toDate), 'MMM dd')}
                  </div>
                </div>
                
                {/* Days (Desktop only) */}
                <div className="hidden md:flex md:col-span-2 items-center text-sm">
                  {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                </div>
                
                {/* Reason (Desktop only) */}
                <div className="hidden md:block md:col-span-3 text-sm text-gray-600 line-clamp-2">
                  {leave.reason}
                </div>
                
                {/* Status */}
                <div className="col-span-3 md:col-span-1 flex items-center">
                  <StatusBadge status={leave.status} />
                </div>
                
                {/* Actions */}
                <div className="col-span-2 md:col-span-2 flex items-center gap-2">
                  {leave.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'rejected')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                  {leave.status !== 'pending' && (
                    <span className="text-xs text-gray-400">
                      {format(parseISO(leave.updatedAt), 'MMM dd')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Pagination */}
          {filteredLeaves.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaves.length)} of {filteredLeaves.length} leaves
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg flex items-center gap-1 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavesManage;