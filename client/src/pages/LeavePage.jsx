import React from 'react';
import { useLeave } from '../context/LeaveContext';
import LeaveForm from '../components/LeaveForm';
import StatusBadge from '../components/StatusBadge';

const LeavePage = () => {
  const { leaves, loading, error } = useLeave();

  return (
    <div className="p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-text-main">Request Leave</h1>
          </div>
          <div className="p-4">
            <LeaveForm />
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-text-main">Leave History</h2>
          </div>
          <div className="p-4">
            {loading && <p className="text-primary text-center">Loading...</p>}
            {error && <p className="text-error text-center">{error}</p>}
            {leaves.length === 0 && !loading ? (
              <p className="text-muted text-center">No leave records found.</p>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => (
                  <div key={leave._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-text-main">{leave.reason}</p>
                        <p className="text-sm text-muted">
                          {new Date(leave.fromDate).toLocaleDateString()} -{' '}
                          {new Date(leave.toDate).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={leave.status} />
                    </div>
                    {leave.rejectionReason && (
                      <div className="mt-2 bg-bg-light p-2 rounded">
                        <p className="text-sm font-medium text-muted">Reason:</p>
                        <p className="text-sm text-muted">{leave.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavePage;