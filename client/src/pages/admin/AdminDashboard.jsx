import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Calendar, Briefcase, 
  CheckCircle, XCircle, Clock,
  ArrowRight, PieChart, BarChart2,
  Activity, Download
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    employees, 
    leaves, 
    departments,
    fetchEmployees,
    fetchLeaves,
    fetchDepartments,
    loading 
  } = useAdmin();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
      fetchLeaves();
      fetchDepartments();
    }
  }, [user, fetchEmployees, fetchLeaves, fetchDepartments]);

  // Prepare chart data
  const employeeStatusData = [
    { name: 'Active', value: employees.filter(e => e.status === 'active').length },
    { name: 'Pending', value: employees.filter(e => e.status === 'pending').length },
    { name: 'Suspended', value: employees.filter(e => e.status === 'suspended').length },
  ];

  const leaveStatusData = [
    { name: 'Approved', value: leaves.filter(l => l.status === 'approved').length },
    { name: 'Pending', value: leaves.filter(l => l.status === 'pending').length },
    { name: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length },
  ];

  // eslint-disable-next-line no-unused-vars
  const departmentDistributionData = departments.map(dept => ({
    name: dept.name,
    employees: employees.filter(e => e.department?._id === dept._id).length
  }));

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold">{employees.length}</p>
              </div>
              <Users size={24} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Leaves</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {leaves.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <Calendar size={24} className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-2xl font-semibold">{departments.length}</p>
              </div>
              <Briefcase size={24} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Duties</p>
                <p className="text-2xl font-semibold text-green-600">
                  {employees.reduce((acc, emp) => acc + (emp.duties?.length || 0), 0)}
                </p>
              </div>
              <Activity size={24} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Status Pie Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PieChart size={20} className="text-blue-500" />
                Employee Status
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChartComponent>
                  <Pie
                    data={employeeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {employeeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartComponent>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Status Bar Chart */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart2 size={20} className="text-green-500" />
                Leave Status
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Download size={16} />
                Export
              </button>
            </div>
            <div className="h-64">
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Recent Employees
              </h2>
              <Link to="/admin/employees" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Clock className="animate-spin text-gray-400" />
                </div>
              ) : employees.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No employees found</p>
              ) : (
                <div className="space-y-4">
                  {employees.slice(0, 5).map(employee => (
                    <div key={employee._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : employee.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedEmployeeId(employee._id);
                            setModalOpen(true);
                          }}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-yellow-500" />
                Pending Leaves
              </h2>
              <Link to="/admin/leaves" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </Link>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Clock className="animate-spin text-gray-400" />
                </div>
              ) : leaves.filter(l => l.status === 'pending').length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pending leaves</p>
              ) : (
                <div className="space-y-4">
                  {leaves
                    .filter(l => l.status === 'pending')
                    .slice(0, 5)
                    .map(leave => (
                      <div key={leave._id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="bg-yellow-100 p-2 rounded-full mt-1">
                          <Clock size={16} className="text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">{leave.reason}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {leave.employee?.name || 'Unknown employee'}
                          </p>
                        </div>
                        <Link 
                          to={`/admin/leaves/${leave._id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/employees" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Users size={20} className="text-blue-500" />
            <span>Manage Employees</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/admin/leaves" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Calendar size={20} className="text-yellow-500" />
            <span>Review Leaves</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/admin/departments" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Briefcase size={20} className="text-green-500" />
            <span>Departments</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
          </Link>
          <Link 
            to="/admin/analytics" 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <PieChart size={20} className="text-purple-500" />
            <span>Advanced Analytics</span>
            <ArrowRight size={16} className="ml-auto text-gray-400" />
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