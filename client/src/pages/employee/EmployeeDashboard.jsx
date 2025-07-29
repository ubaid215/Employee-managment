import { useEffect } from 'react';
import { useEmployee } from '../../context/EmployeeContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, DollarSign, 
  ArrowRight, Clock, CheckCircle, 
  XCircle, AlertCircle, Loader2, User,
  PieChart, BarChart2, FileText,
  PlusCircle, TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as PieChartComponent,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending':
        return <Clock size={16} className="text-amber-500" />;
      default:
        return <AlertCircle size={16} className="text-slate-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Chart data preparation
  const dutyStatusData = [
    { name: 'Active', value: duties?.filter(d => d.status === 'active').length || 0 },
    { name: 'Completed', value: duties?.filter(d => d.status === 'completed').length || 0 },
    { name: 'Pending', value: duties?.filter(d => d.status === 'pending').length || 0 },
  ];

  const leaveStatusData = [
    { name: 'Approved', value: leaves?.filter(l => l.status === 'approved').length || 0 },
    { name: 'Pending', value: leaves?.filter(l => l.status === 'pending').length || 0 },
    { name: 'Rejected', value: leaves?.filter(l => l.status === 'rejected').length || 0 },
  ];

  const salaryByMonthData = salaryRecords?.slice(0, 6).map(record => ({
    name: record.month.slice(0, 3),
    amount: record.amount
  })).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 text-lg">Here's your work overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Duties</p>
                <p className="text-3xl font-bold text-blue-600">
                  {duties?.filter(d => d.status === 'active').length || 0}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp size={12} className="text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">+1 this week</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Briefcase size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Approved Leaves</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {leaves?.filter(l => l.status === 'approved').length || 0}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <CheckCircle size={12} className="text-emerald-500 mr-1" />
                  <span className="text-emerald-600 font-medium">All clear</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Salary Records</p>
                <p className="text-3xl font-bold text-purple-600">
                  {salaryRecords?.length || 0}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <DollarSign size={12} className="text-purple-500 mr-1" />
                  <span className="text-purple-600 font-medium">Last: {salaryRecords?.[0]?.month || 'None'}</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Duty Status Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <PieChart size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Duty Status</span>
              </h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChartComponent>
                  <Pie
                    data={dutyStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {dutyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChartComponent>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary History Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <BarChart2 size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Salary History</span>
              </h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryByMonthData || []}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value} PKR`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {salaryByMonthData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Duties Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Briefcase size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Recent Duties</span>
              </h2>
              <Link 
                to="/duties" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (duties || []).length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No duties assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(duties || []).slice(0, 3).map(duty => (
                    <div key={duty._id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-slate-200">
                      <div className="flex-shrink-0 mt-1">
                        <Briefcase size={20} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800">{duty.name}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-1">{duty.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            duty.status === 'active' 
                              ? 'bg-blue-100 text-blue-800' 
                              : duty.status === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-800'
                          }`}>
                            {duty.status}
                          </span>
                          <span className="text-xs text-slate-500">
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Recent Leaves</span>
              </h2>
              <Link 
                to="/leave" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (leaves || []).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No leave records</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(leaves || []).slice(0, 3).map(leave => (
                    <div key={leave._id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-slate-200">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(leave.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 line-clamp-1">{leave.reason}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                        </p>
                        {leave.rejectionReason && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg">
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <DollarSign size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Recent Salaries</span>
              </h2>
              <Link 
                to="/salary" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (salaryRecords || []).length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No salary records</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(salaryRecords || []).slice(0, 3).map(salary => (
                    <div key={salary._id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-slate-200">
                      <div className="flex-shrink-0 mt-1">
                        <DollarSign size={20} className="text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-slate-800">{salary.month}</h3>
                          <span className="font-bold text-purple-600">
                            {salary.amount.toLocaleString()} PKR
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Paid on {formatDate(salary.paidOn)}
                        </p>
                        <div className="mt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            salary.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : salary.status === 'pending' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-800'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/duties" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Briefcase size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">View Duties</span>
              <p className="text-xs text-slate-500 mt-1">Check your current tasks</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/leave/apply" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <PlusCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Apply Leave</span>
              <p className="text-xs text-slate-500 mt-1">Request time off</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/salary" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Payslips</span>
              <p className="text-xs text-slate-500 mt-1">View salary history</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/profile" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">My Profile</span>
              <p className="text-xs text-slate-500 mt-1">Update personal info</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;