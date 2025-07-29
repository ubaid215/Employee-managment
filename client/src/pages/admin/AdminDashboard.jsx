import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Calendar, Briefcase, 
  CheckCircle, XCircle, Clock,
  ArrowRight, PieChart, BarChart2,
  Activity, Download, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DepartmentChangeModal from './DepartmentChangeModal';
import {
  PieChart as PieChartComponent,
  BarChart,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    employees = [], 
    leaves = [], 
    departments = [],
    fetchEmployees,
    fetchAllLeaves,
    fetchDepartments,
    loading 
  } = useAdmin();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
      fetchAllLeaves();
      fetchDepartments();
    }
  }, [user, fetchEmployees, fetchAllLeaves, fetchDepartments]);

  // Prepare chart data with safe defaults
  const employeeStatusData = [
    { name: 'Active', value: employees.filter(e => e?.status === 'active').length },
    { name: 'Pending', value: employees.filter(e => e?.status === 'pending').length },
    { name: 'Suspended', value: employees.filter(e => e?.status === 'suspended').length },
  ];

  const leaveStatusData = [
    { name: 'Approved', value: leaves.filter(l => l?.status === 'approved').length },
    { name: 'Pending', value: leaves.filter(l => l?.status === 'pending').length },
    { name: 'Rejected', value: leaves.filter(l => l?.status === 'rejected').length },
  ];

  const departmentDistributionData = departments.map(dept => ({
    name: dept?.name || 'Unknown',
    employees: employees.filter(e => e?.department?._id === dept?._id).length
  }));

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Overview and analytics for your organization</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-slate-800">{employees.length}</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp size={12} className="text-emerald-500 mr-1" />
                  <span className="text-emerald-600 font-medium">+2.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending Leaves</p>
                <p className="text-3xl font-bold text-amber-600">
                  {leaves.filter(l => l?.status === 'pending').length}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <Clock size={12} className="text-amber-500 mr-1" />
                  <span className="text-amber-600 font-medium">Requires attention</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Departments</p>
                <p className="text-3xl font-bold text-slate-800">{departments.length}</p>
                <div className="flex items-center mt-2 text-xs">
                  <CheckCircle size={12} className="text-emerald-500 mr-1" />
                  <span className="text-emerald-600 font-medium">All active</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Briefcase size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Duties</p>
                <p className="text-3xl font-bold text-purple-600">
                  {employees.reduce((acc, emp) => acc + (emp?.duties?.length || 0), 0)}
                </p>
                <div className="flex items-center mt-2 text-xs">
                  <Activity size={12} className="text-purple-500 mr-1" />
                  <span className="text-purple-600 font-medium">Ongoing tasks</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Activity size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Status Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <PieChart size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Employee Status</span>
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChartComponent>
                  <Pie
                    data={employeeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {employeeStatusData.map((entry, index) => (
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

          {/* Leave Status Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <BarChart2 size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Leave Status</span>
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leaveStatusData}
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
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {leaveStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Employees */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Users size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Recent Employees</span>
              </h2>
              <Link 
                to="/admin/employees" 
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
              ) : employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No employees found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.slice(0, 5).map((employee, index) => (
                    <div key={employee._id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-white" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            employee.status === 'active' ? 'bg-emerald-500' : 
                            employee.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{employee.name}</h3>
                          <p className="text-sm text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          employee.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : employee.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedEmployeeId(employee._id);
                            setModalOpen(true);
                          }}
                          className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors duration-200"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                  <Calendar size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Pending Leaves</span>
              </h2>
              <Link 
                to="/admin/leaves" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                View all
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                </div>
              ) : leaves.filter(l => l.status === 'pending').length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No pending leaves</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves
                    .filter(l => l.status === 'pending')
                    .slice(0, 5)
                    .map(leave => (
                      <div key={leave._id} className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors duration-200 border border-transparent hover:border-slate-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Clock size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 line-clamp-1">{leave.reason}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {leave.employee?.name || 'Unknown employee'}
                          </p>
                        </div>
                        <Link 
                          to={`/admin/leaves/${leave._id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium flex-shrink-0"
                        >
                          Review <ArrowRight size={14} className="ml-1" />
                        </Link>
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
            to="/admin/all-employees" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Manage Employees</span>
              <p className="text-xs text-slate-500 mt-1">View and manage all employees</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/admin/leaves-manage" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Review Leaves</span>
              <p className="text-xs text-slate-500 mt-1">Approve or reject leave requests</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/admin/departments" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <Briefcase size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Departments</span>
              <p className="text-xs text-slate-500 mt-1">Manage organizational structure</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>

          <Link 
            to="/admin/analytics" 
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/60 flex items-center gap-4 hover:bg-slate-50 transition-all duration-200 group backdrop-blur-sm hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <PieChart size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-slate-800">Advanced Analytics</span>
              <p className="text-xs text-slate-500 mt-1">Detailed insights and reports</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
          </Link>
        </div>

        <DepartmentChangeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employeeId={selectedEmployeeId}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;