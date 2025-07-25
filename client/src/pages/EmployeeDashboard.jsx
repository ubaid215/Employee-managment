import React from 'react';
import { useDuty } from '../context/DutyContext';
import { useLeave } from '../context/LeaveContext';
import { useSalary } from '../context/SalaryContext';
import { Link } from 'react-router-dom';
import DutyForm from '../components/DutyForm';
import StatusBadge from '../components/StatusBadge';
import useProtectedRoute from '../hooks/useProtectedRoute';

const EmployeeDashboard = () => {
  const { loading: authLoading } = useProtectedRoute();
  const { duties, loading: dutyLoading, error: dutyError } = useDuty();
  const { leaves, loading: leaveLoading, error: leaveError } = useLeave();
  const { salaries, loading: salaryLoading, error: salaryError } = useSalary();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-bg-light">
        <p className="text-primary text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-text-main mb-6">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Duties Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Your Duties</h2>
          </div>
          <div className="p-4">
            {dutyLoading && <p className="text-primary text-center animate-pulse">Loading duties...</p>}
            {dutyError && <p className="text-error text-center">{dutyError}</p>}
            {duties.length === 0 && !dutyLoading ? (
              <p className="text-muted text-center">No duties assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {duties.slice(0, 2).map((duty) => (
                  <DutyForm key={duty._id} duty={duty} />
                ))}
                {duties.length > 2 && (
                  <Link
                    to="/duties"
                    className="btn-secondary w-full mt-4 text-center"
                  >
                    View All Duties
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Leaves Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Recent Leaves</h2>
          </div>
          <div className="p-4">
            {leaveLoading && <p className="text-primary text-center animate-pulse">Loading leaves...</p>}
            {leaveError && <p className="text-error text-center">{leaveError}</p>}
            {leaves.length === 0 && !leaveLoading ? (
              <p className="text-muted text-center">No leave records found.</p>
            ) : (
              <div className="space-y-4">
                {leaves.slice(0, 2).map((leave) => (
                  <div key={leave._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="font-medium text-text-main">{leave.reason}</p>
                    <p className="text-sm text-muted">
                      {new Date(leave.fromDate).toLocaleDateString()} -{' '}
                      {new Date(leave.toDate).toLocaleDateString()}
                    </p>
                    <StatusBadge status={leave.status} className="mt-2" />
                  </div>
                ))}
                {leaves.length > 2 && (
                  <Link
                    to="/leaves"
                    className="btn-secondary w-full mt-4 text-center"
                  >
                    View All Leaves
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Salaries Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Recent Salaries</h2>
          </div>
          <div className="p-4">
            {salaryLoading && <p className="text-primary text-center animate-pulse">Loading salaries...</p>}
            {salaryError && <p className="text-error text-center">{salaryError}</p>}
            {salaries.length === 0 && !salaryLoading ? (
              <p className="text-muted text-center">No salary records found.</p>
            ) : (
              <div className="space-y-4">
                {salaries.slice(0, 2).map((salary) => (
                  <div key={salary._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text-main">{salary.month}</p>
                        <p className="text-sm text-muted">
                          {salary.amount} PKR
                        </p>
                      </div>
                      <StatusBadge status={salary.status} />
                    </div>
                    {salary.note && (
                      <p className="text-xs text-muted mt-2">{salary.note}</p>
                    )}
                  </div>
                ))}
                {salaries.length > 2 && (
                  <Link
                    to="/salary"
                    className="btn-secondary w-full mt-4 text-center"
                  >
                    View All Salaries
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;