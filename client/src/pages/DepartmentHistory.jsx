import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDepartmentHistory } from '../services/adminService';

const DepartmentHistory = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getDepartmentHistory(id);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  return (
    <div className="p-4 md:p-6">
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-text-main">Department History</h1>
        </div>
        <div className="p-4">
          {loading && <p className="text-primary text-center">Loading...</p>}
          {error && <p className="text-error text-center">{error}</p>}
          {history.length === 0 && !loading ? (
            <p className="text-muted text-center">No history found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-text-main">{record.action}</p>
                      <p className="text-sm text-muted">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs bg-bg-light px-2 py-1 rounded-full">
                      {record.admin.name}
                    </span>
                  </div>
                  {record.reason && (
                    <p className="mt-2 text-sm text-muted bg-bg-light p-2 rounded">
                      {record.reason}
                    </p>
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

export default DepartmentHistory;