// EmployeeDetails.jsx - Complete Fixed Component
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { 
  User, Mail, Phone, Home, 
  Briefcase, Calendar, Clock,
  CreditCard, ChevronLeft, Edit,
  CheckCircle, XCircle, Clock as PendingIcon,
  Loader2, ArrowRight, MoreVertical
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const EmployeeDetails = () => {
  // FIX 1: Change from employeeId to id to match the route parameter
  const { id } = useParams(); // This should match your route: /employees/:id
  const navigate = useNavigate();
  const { 
    getEmployeeDetails, 
    changeEmployeeStatus,
    loading,
    error 
  } = useAdmin();
  
  const [employee, setEmployee] = useState(null);
  const [status, setStatus] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      // FIX 2: Add validation before making API call
      if (!id) {
        console.error('Employee ID is missing from URL parameters');
        setFetchError('Employee ID is missing from URL parameters');
        return;
      }

      if (id === 'undefined' || id === 'null') {
        console.error('Invalid employee ID:', id);
        setFetchError('Invalid employee ID provided');
        return;
      }

      try {
        setFetchError(null);
        // console.log('Fetching employee with ID:', id);
        const data = await getEmployeeDetails(id);
        // console.log('Employee data received:', data);
        setEmployee(data);
        setStatus(data?.status || '');
      } catch (err) {
        console.error('Failed to fetch employee:', err);
        setFetchError(err.message || 'Failed to fetch employee details');
      }
    };
    
    fetchEmployee();
  }, [id, getEmployeeDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      await changeEmployeeStatus(id, newStatus);
      setStatus(newStatus);
      setEmployee(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Status change failed:', err);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
          <p className="text-slate-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || fetchError || !employee) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 max-w-md text-center backdrop-blur-sm">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Employee Not Found</h2>
          <p className="text-slate-600 mb-6">{error || fetchError || 'The requested employee does not exist'}</p>
          <button
            onClick={() => navigate('/admin/employees')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-md transition-all"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/admin/employees')}
            className="p-2 rounded-full bg-white shadow-sm border border-slate-200"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <StatusBadge status={employee.status} />
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-white shadow-sm border border-slate-200"
            >
              <MoreVertical size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white rounded-xl shadow-lg mb-6 p-3 border border-slate-200/60">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full mb-3 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <button
            onClick={() => navigate('/admin/employees')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4 group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to employees
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {employee.name}
              </h1>
              <p className="text-slate-600">{employee.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={employee.status} large />
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Personal Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Mail size={18} className="text-slate-400 flex-shrink-0" />
                        <p className="text-slate-800">{employee.email}</p>
                      </div>
                      {employee.profile?.phone && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Phone size={18} className="text-slate-400 flex-shrink-0" />
                          <p className="text-slate-800">{employee.profile.phone}</p>
                        </div>
                      )}
                      {employee.profile?.address && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Home size={18} className="text-slate-400 flex-shrink-0" />
                          <p className="text-slate-800 line-clamp-2">{employee.profile.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Employment</h3>
                    <div className="space-y-3">
                      {employee.department && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Briefcase size={18} className="text-slate-400 flex-shrink-0" />
                          <p className="text-slate-800">{employee.department.name}</p>
                        </div>
                      )}
                      {employee.profile?.joiningDate && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Calendar size={18} className="text-slate-400 flex-shrink-0" />
                          <p className="text-slate-800">
                            Joined {new Date(employee.profile.joiningDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <CreditCard size={18} className="text-slate-400 flex-shrink-0" />
                        <p className="text-slate-800">
                          {employee.employeeId || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Assignment */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <span className="text-slate-800">Department & Duties</span>
                </h2>
              </div>
              
              {employee.department ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Department</h4>
                    <p className="font-medium text-slate-800">
                      {typeof employee.department === 'object' ? employee.department.name : 'Department details not populated'}
                    </p>
                  </div>
                  {employee.duties?.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">Assigned Duties ({employee.duties.length}):</p>
                      <ul className="space-y-2">
                        {employee.duties.map((duty, index) => (
                          <li key={duty._id || duty || index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-slate-800 font-medium">
                                {typeof duty === 'object' ? duty.title : `Duty ID: ${duty}`}
                              </span>
                              {typeof duty === 'object' && duty.description && (
                                <p className="text-sm text-slate-500 mt-1">{duty.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <p className="text-slate-500">No duties assigned</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-slate-500">No department assigned</p>
                </div>
              )}
            </div>

            {/* Additional Employee Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Additional Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">CNIC</h3>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-slate-800 font-mono">
                        {employee.profile?.cnic || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Emergency Contact</h3>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                      {employee.profile?.emergencyContact ? (
                        <>
                          <p className="text-slate-800 font-medium">
                            {employee.profile.emergencyContact.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {employee.profile.emergencyContact.relation}
                          </p>
                          <p className="text-sm text-slate-600 font-mono">
                            {employee.profile.emergencyContact.phone}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Record Counts</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {employee.salaryRecords?.length || 0}
                        </p>
                        <p className="text-sm text-slate-600">Salary Records</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {employee.leaveRecords?.length || 0}
                        </p>
                        <p className="text-sm text-slate-600">Leave Records</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {employee.history?.length || 0}
                        </p>
                        <p className="text-sm text-slate-600">History Records</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {employee.duties?.length || 0}
                        </p>
                        <p className="text-sm text-slate-600">Assigned Duties</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Clock size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Recent Activity</span>
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Last Login</p>
                  <p className="font-medium text-slate-800">
                    {employee.lastLogin 
                      ? new Date(employee.lastLogin).toLocaleString() 
                      : 'Never logged in'}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Account Created</p>
                  <p className="font-medium text-slate-800">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Leave Status</span>
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500">Approved</p>
                    <p className="font-medium text-slate-800">{employee.stats?.leaves?.find(l => l._id === 'approved')?.count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <PendingIcon size={18} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500">Pending</p>
                    <p className="font-medium text-slate-800">{employee.stats?.leaves?.find(l => l._id === 'pending')?.count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <XCircle size={18} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-500">Rejected</p>
                    <p className="font-medium text-slate-800">{employee.stats?.leaves?.find(l => l._id === 'rejected')?.count || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default EmployeeDetails;