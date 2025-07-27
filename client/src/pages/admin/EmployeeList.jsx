import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import EmployeeCard from './EmployeeCard';
import { 
  Users, Search, Filter, 
  ChevronDown, Loader2, X, 
  AlertCircle, Frown, Smile
} from 'lucide-react';

const EmployeeList = () => {
  const { employees, fetchEmployees, loading, error } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Safe filtering with null/undefined checks
  const filteredEmployees = (employees || []).filter(employee => {
    const matchesSearch = 
      employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      !filters.status || employee?.status === filters.status;
    
    const matchesDepartment = 
      !filters.department || 
      (employee?.department && employee.department._id === filters.department);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const clearFilters = () => {
    setFilters({ status: '', department: '' });
    setSearchTerm('');
  };

  // Safe department extraction
  const uniqueDepartments = [...new Set(
    (employees || [])
      .filter(e => e?.department)
      .map(e => ({ id: e.department._id, name: e.department.name }))
  )];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Employee Management
                </h1>
                <p className="text-slate-600 mt-1">
                  {(employees || []).length} {employees?.length === 1 ? 'employee' : 'employees'} in your organization
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
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-all duration-200 focus:bg-white"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              <ChevronDown size={18} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 transition-colors"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={16} />
                  <span className="font-medium">Clear filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading && !(employees || []).length ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200/60 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
              <p className="text-slate-600 font-medium">Loading employees...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3 text-red-700">
              <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Error Loading Employees</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full w-fit mx-auto mb-4">
                {searchTerm || filters.status || filters.department ? (
                  <Frown size={48} className="text-slate-400" />
                ) : (
                  <Smile size={48} className="text-slate-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm || filters.status || filters.department
                  ? 'No matching employees found'
                  : 'Your team is empty'
                }
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {searchTerm || filters.status || filters.department
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by adding your first employee'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results header */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200/60 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  Showing {filteredEmployees.length} of {(employees || []).length} employees
                </h2>
                {(searchTerm || filters.status || filters.department) && (
                  <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-medium">
                    Filtered results
                  </span>
                )}
              </div>
            </div>
            
            {/* Employee grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => (
                <EmployeeCard key={employee._id} employee={employee} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;