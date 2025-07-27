import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Calendar, Clock, User, Check, X, 
  ChevronLeft, ChevronRight, Loader2, Filter,
  AlertCircle, Clock as PendingIcon, Search,
  ChevronDown, ChevronUp
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchEmployees();
    fetchAllLeaves();
  }, []);

  // Helper function to safely format dates
  const safeFormatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Filter leaves based on selected filters with safe array access
  const filteredLeaves = (allLeaves || []).filter(leave => {
    try {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        leave?.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave?.reason?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === '' || leave?.status === filters.status;
      
      // Employee filter
      const matchesEmployee = filters.employee === '' || leave?.employee?._id === filters.employee;
      
      // Month filter
      let matchesMonth = true;
      if (filters.month !== '' && leave?.fromDate) {
        try {
          const leaveMonth = format(parseISO(leave.fromDate), 'MMMM yyyy');
          matchesMonth = leaveMonth === filters.month;
        } catch (err) {
          console.error('Error parsing date for filtering:', err);
          matchesMonth = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesEmployee && matchesMonth;
    } catch (err) {
      console.error('Error filtering leave:', err);
      return false;
    }
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
      fetchAllLeaves(); // Refresh data
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
    const baseClasses = "px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 w-fit";
    
    const statusClasses = {
      pending: "bg-amber-100 text-amber-800 border border-amber-200",
      approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      rejected: "bg-rose-100 text-rose-800 border border-rose-200"
    };
    
    const statusIcons = {
      pending: <PendingIcon size={12} />,
      approved: <Check size={12} />,
      rejected: <X size={12} />
    };
    
    return (
      <span className={`${baseClasses} ${statusClasses[status]}`}>
        {statusIcons[status]}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Leave Management
                </h1>
                <p className="text-slate-600 mt-1">
                  Manage and process employee leave requests
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200/60 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by employee name or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-all duration-200 focus:bg-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Employee</label>
                <select
                  value={filters.employee}
                  onChange={(e) => setFilters({...filters, employee: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-colors"
                >
                  <option value="">All Employees</option>
                  {(employees || []).map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Month Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({...filters, month: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-colors"
                >
                  <option value="">All Months</option>
                  {generateMonthOptions().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 mb-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Leave Requests ({filteredLeaves.length})
            </h3>
            {(filters.status || filters.employee || filters.month || searchQuery) && (
              <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
                Filtered results
              </span>
            )}
          </div>
        </div>
        
        {/* Leaves Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200/60 backdrop-blur-sm">
          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
              <p className="text-slate-600 font-medium">Loading leave requests...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-6 flex items-start gap-3 text-red-700 bg-red-50 border-b border-red-200">
              <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="font-semibold">Error Loading Leaves</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && currentLeaves.length === 0 && (
            <div className="p-12 text-center">
              <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full w-fit mx-auto mb-4">
                <Calendar size={48} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {filters.status || filters.employee || filters.month || searchQuery
                  ? 'No matching leave requests'
                  : 'No leave requests found'
                }
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {filters.status || filters.employee || filters.month || searchQuery
                  ? 'Try adjusting your filters or search query'
                  : 'No leave requests have been submitted yet'
                }
              </p>
            </div>
          )}
          
          {/* Leaves List */}
          {!loading && currentLeaves.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white font-semibold">
                  <div className="col-span-3">Employee</div>
                  <div className="col-span-2">Leave Period</div>
                  <div className="col-span-1">Duration</div>
                  <div className="col-span-3">Reason</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                {/* Table Rows */}
                {currentLeaves.map((leave) => (
                  <div 
                    key={leave._id} 
                    className={`grid grid-cols-12 gap-4 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      leave.status === 'pending' ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* Employee */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                        <User size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {leave.employee?.name || 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {leave.employee?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Leave Period */}
                    <div className="col-span-2 flex flex-col justify-center space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        {safeFormatDate(leave.fromDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {safeFormatDate(leave.toDate, 'MMM dd, yyyy')}
                      </div>
                    </div>
                    
                    {/* Duration */}
                    <div className="col-span-1 flex items-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {leave.totalDays || 0} day{(leave.totalDays || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Reason */}
                    <div className="col-span-3 text-sm text-slate-600">
                      <div className="line-clamp-2 bg-slate-50 p-2 rounded-lg">
                        {leave.reason || 'No reason provided'}
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-1 flex items-center">
                      <StatusBadge status={leave.status} />
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-2 flex items-center gap-2">
                      {leave.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLeaveAction(leave._id, 'approved')}
                            className="p-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave._id, 'rejected')}
                            className="p-2 text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                          Updated: {safeFormatDate(leave.updatedAt, 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {currentLeaves.map((leave) => (
                  <div 
                    key={leave._id} 
                    className={`p-5 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all ${
                      leave.status === 'pending' ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {leave.employee?.name || 'Unknown Employee'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {leave.employee?.employeeId || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <span className="text-slate-500">From: </span>
                          <span className="font-medium text-slate-700">
                            {safeFormatDate(leave.fromDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock size={14} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <span className="text-slate-500">To: </span>
                          <span className="font-medium text-slate-700">
                            {safeFormatDate(leave.toDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-slate-400">•</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Duration: </span>
                          <span className="font-medium text-blue-600">
                            {leave.totalDays || 0} day{(leave.totalDays || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Reason:</span> {leave.reason || 'No reason provided'}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-slate-500">
                          Updated: {safeFormatDate(leave.updatedAt, 'MMM dd, yyyy')}
                        </div>
                        
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLeaveAction(leave._id, 'approved')}
                              className="p-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave._id, 'rejected')}
                              className="p-2 text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Pagination */}
          {filteredLeaves.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 border-t border-slate-200">
              <div className="text-sm text-slate-600 mb-3 sm:mb-0 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaves.length)} of {filteredLeaves.length} requests
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
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