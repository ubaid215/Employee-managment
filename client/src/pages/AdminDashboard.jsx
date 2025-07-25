import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLeave } from '../context/LeaveContext';
import { getAllEmployees, changeStatus } from '../services/adminService';
import DepartmentChangeModal from '../components/DepartmentChangeModal';
import StatusBadge from '../components/StatusBadge'; 

const AdminDashboard = () => {
  const { user } = useUser();
  const { leaves } = useLeave();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const data = await getAllEmployees();
          setEmployees(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [user]);

  const handleStatusChange = async (employeeId, status) => {
    try {
      await changeStatus(employeeId, status);
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === employeeId ? { ...emp, status } : emp))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (user?.role !== 'admin') return <p className="text-error text-center p-4">Access Denied</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Employees Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Manage Employees</h2>
          </div>
          <div className="p-4">
            {loading && <p className="text-primary text-center">Loading...</p>}
            {error && <p className="text-error text-center">{error}</p>}
            {employees.length === 0 && !loading && (
              <p className="text-muted text-center">No employees found.</p>
            )}
            <div className="space-y-3">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp._id} className="flex items-center justify-between p-3 hover:bg-bg-light rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-text-main">{emp.name}</p>
                    <StatusBadge status={emp.status} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmployeeId(emp._id);
                        setModalOpen(true);
                      }}
                      className="btn-secondary px-3 py-1 text-sm"
                    >
                      Assign
                    </button>
                    <select
                      value={emp.status}
                      onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                      className="text-sm border rounded-md p-1 focus-ring"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Leaves Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Pending Leaves</h2>
          </div>
          <div className="p-4">
            {leaves.filter((leave) => leave.status === 'pending').length === 0 ? (
              <p className="text-muted text-center">No pending leaves.</p>
            ) : (
              <div className="space-y-3">
                {leaves
                  .filter((leave) => leave.status === 'pending')
                  .slice(0, 5)
                  .map((leave) => (
                    <div key={leave._id} className="p-3 hover:bg-bg-light rounded-lg transition-colors">
                      <p className="font-medium text-text-main">{leave.reason}</p>
                      <p className="text-sm text-muted">
                        {new Date(leave.fromDate).toLocaleDateString()} -{' '}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                      <StatusBadge status="pending" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Card (Added new) */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Quick Stats</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="bg-bg-light p-3 rounded-lg">
              <p className="text-sm text-muted">Total Employees</p>
              <p className="text-2xl font-semibold">{employees.length}</p>
            </div>
            <div className="bg-bg-light p-3 rounded-lg">
              <p className="text-sm text-muted">Active</p>
              <p className="text-2xl font-semibold text-accent">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="bg-bg-light p-3 rounded-lg">
              <p className="text-sm text-muted">Pending Leaves</p>
              <p className="text-2xl font-semibold text-warning">
                {leaves.filter(l => l.status === 'pending').length}
              </p>
            </div>
            <div className="bg-bg-light p-3 rounded-lg">
              <p className="text-sm text-muted">Departments</p>
              <p className="text-2xl font-semibold">-</p>
            </div>
          </div>
        </div>
      </div>

      <DepartmentChangeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeId={selectedEmployeeId}
      />
    </div>
  );
};

export default AdminDashboard;