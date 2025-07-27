import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { 
  User, Mail, Phone, Home, 
  Briefcase, Calendar, Clock,
  CreditCard, ChevronLeft, Edit,
  CheckCircle, XCircle, Clock as PendingIcon,
  Loader2
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import DepartmentChangeModal from './DepartmentChangeModal';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { 
    getEmployeeDetails, 
    changeEmployeeStatus,
    loading,
    error 
  } = useAdmin();
  
  const [employee, setEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeDetails(employeeId);
        setEmployee(data);
        setStatus(data.status);
      } catch (err) {
        console.error('Failed to fetch employee:', err);
      }
    };
    
    fetchEmployee();
  }, [employeeId, getEmployeeDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      await changeEmployeeStatus(employeeId, newStatus);
      setStatus(newStatus);
      setEmployee(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Status change failed:', err);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md text-center">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested employee does not exist'}</p>
          <button
            onClick={() => navigate('/admin/employees')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/employees')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft size={18} />
            Back to employees
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={employee.status} large />
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-500" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Contact</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {employee.email}
                    </p>
                    {employee.profile?.phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {employee.profile.phone}
                      </p>
                    )}
                    {employee.profile?.address && (
                      <p className="flex items-center gap-2">
                        <Home size={16} className="text-gray-400" />
                        <span className="line-clamp-1">{employee.profile.address}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Employment</h3>
                  <div className="space-y-2">
                    {employee.department && (
                      <p className="flex items-center gap-2">
                        <Briefcase size={16} className="text-gray-400" />
                        {employee.department.name}
                      </p>
                    )}
                    {employee.profile?.joiningDate && (
                      <p className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        Joined {new Date(employee.profile.joiningDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      {employee.employeeId || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Assignment */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-500" />
                  Department & Duties
                </h2>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Edit size={14} />
                  Change
                </button>
              </div>
              
              {employee.department ? (
                <div>
                  <p className="font-medium">{employee.department.name}</p>
                  {employee.duties?.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-500">Assigned Duties:</p>
                      <ul className="list-disc list-inside text-sm">
                        {employee.duties.map(duty => (
                          <li key={duty._id}>{duty.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No duties assigned</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No department assigned</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">
                    {employee.lastLogin 
                      ? new Date(employee.lastLogin).toLocaleString() 
                      : 'Never logged in'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" />
                Leave Status
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Approved: {employee.leaveStats?.approved || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PendingIcon size={16} className="text-yellow-500" />
                  <span>Pending: {employee.leaveStats?.pending || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  <span>Rejected: {employee.leaveStats?.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DepartmentChangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeId={employeeId}
        currentDepartment={employee.department?._id}
      />
    </div>
  );
};

export default EmployeeDetails;