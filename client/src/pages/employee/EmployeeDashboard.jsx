import  {useEffect} from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, DollarSign, 
  ArrowRight, Clock, CheckCircle, 
  XCircle, AlertCircle, Loader2 
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { 
    duties, 
    leaves, 
    salaryRecords,
    fetchMyDuties,
    fetchLeaves,
    fetchSalaryRecords,
    loading 
  } = useEmployee();
  
  const { user } = useAuth();

  useEffect(() => {
    fetchMyDuties();
    fetchLeaves();
    fetchSalaryRecords();
  }, [fetchMyDuties, fetchLeaves, fetchSalaryRecords]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Here's your work overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Duties</p>
                <p className="text-2xl font-semibold">
                  {duties?.filter(d => d.status === 'active').length || 0}
                </p>
              </div>
              <Briefcase size={24} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Leaves</p>
                <p className="text-2xl font-semibold">
                  {leaves?.filter(l => l.status === 'pending').length || 0}
                </p>
              </div>
              <Calendar size={24} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Salary Records</p>
                <p className="text-2xl font-semibold">
                  {salaryRecords?.length || 0}
                </p>
              </div>
              <DollarSign size={24} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Duties Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase size={20} className="text-blue-500" />
                Recent Duties
              </h2>
              <Link to="/duties" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : duties?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No duties assigned</p>
              ) : (
                <div className="space-y-4">
                  {duties.slice(0, 3).map(duty => (
                    <div key={duty._id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <Briefcase size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{duty.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{duty.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {duty.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Due: {formatDate(duty.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaves Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-green-500" />
                Recent Leaves
              </h2>
              <Link to="/leave" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : leaves?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No leave records</p>
              ) : (
                <div className="space-y-4">
                  {leaves.slice(0, 3).map(leave => (
                    <div key={leave._id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(leave.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{leave.reason}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </p>
                        {leave.rejectionReason && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {leave.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Salaries Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign size={20} className="text-purple-500" />
                Recent Salaries
              </h2>
              <Link to="/salary" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : salaryRecords?.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No salary records</p>
              ) : (
                <div className="space-y-4">
                  {salaryRecords.slice(0, 3).map(salary => (
                    <div key={salary._id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">{salary.month}</h3>
                          <span className="font-medium">
                            {salary.amount.toLocaleString()} PKR
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Paid on {formatDate(salary.paidOn)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            salary.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : salary.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {salary.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/duties" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Briefcase size={20} className="text-blue-500" />
            <span>View Duties</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/leave" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Calendar size={20} className="text-green-500" />
            <span>Apply Leave</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/salary" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <DollarSign size={20} className="text-purple-500" />
            <span>Salary Records</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/profile" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <User size={20} className="text-orange-500" />
            <span>My Profile</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;