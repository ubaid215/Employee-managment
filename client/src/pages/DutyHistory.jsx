import React, { useState, useEffect } from 'react';
import { useDuty } from '../context/DutyContext';
import StatusBadge from '../components/StatusBadge';

const DutyHistory = () => {
  const { getTaskLogs, loading, error } = useDuty();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTaskLogs();
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch task logs:', err);
      }
    };
    fetchTasks();
  }, [getTaskLogs]);

  return (
    <div className="p-4 md:p-6">
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-text-main">Duty History</h1>
        </div>
        <div className="p-4">
          {loading && <p className="text-primary text-center">Loading...</p>}
          {error && <p className="text-error text-center">{error}</p>}
          {tasks.length === 0 && !loading ? (
            <p className="text-muted text-center">No task history found.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-text-main">{task.duty.title}</p>
                      <p className="text-sm text-muted">
                        Submitted on {new Date(task.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  {task.feedback && (
                    <div className="mt-2 bg-bg-light p-2 rounded">
                      <p className="text-sm font-medium text-muted">Feedback:</p>
                      <p className="text-sm text-muted">{task.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutyHistory;