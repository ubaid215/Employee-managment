import React, { useState, useEffect } from 'react';
import { useLeave } from '../context/LeaveContext';
import StatusBadge from '../components/StatusBadge';

const LeaveAnalytics = () => {
  const { getLeaveAnalytics, analytics, loading, error } = useLeave();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        await getLeaveAnalytics(year);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, [year, getLeaveAnalytics]);

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-text-main">Leave Analytics</h1>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm text-muted mb-2" htmlFor="year">
              Select Year
            </label>
            <select
              id="year"
              value={year}
              onChange={handleYearChange}
              className="w-full p-2 border rounded-md focus-ring"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          {loading && <p className="text-primary text-center">Loading...</p>}
          {error && <p className="text-error text-center">{error}</p>}

          {analytics ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-light p-3 rounded-lg">
                <p className="text-sm text-muted">Total Leaves</p>
                <p className="text-2xl font-semibold">{analytics.totalLeaves || 0}</p>
              </div>
              <div className="bg-bg-light p-3 rounded-lg">
                <p className="text-sm text-muted">Approved</p>
                <p className="text-2xl font-semibold text-accent">
                  {analytics.approvedLeaves || 0}
                </p>
              </div>
              <div className="bg-bg-light p-3 rounded-lg">
                <p className="text-sm text-muted">Pending</p>
                <p className="text-2xl font-semibold text-warning">
                  {analytics.pendingLeaves || 0}
                </p>
              </div>
              <div className="bg-bg-light p-3 rounded-lg">
                <p className="text-sm text-muted">Rejected</p>
                <p className="text-2xl font-semibold text-error">
                  {analytics.rejectedLeaves || 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted text-center">No analytics available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveAnalytics;