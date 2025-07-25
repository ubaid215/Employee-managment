import React, { useState } from 'react';
import { useLeave } from '../context/LeaveContext';

const LeaveForm = () => {
  const { applyLeave, loading, error } = useLeave();
  const [formData, setFormData] = useState({
    reason: '',
    fromDate: '',
    toDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyLeave(formData.reason, formData.fromDate, formData.toDate);
      setFormData({ reason: '', fromDate: '', toDate: '' });
    } catch (err) {
      console.error('Leave application failed:', err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-4 rounded-lg shadow-md w-full max-w-lg mx-auto"
    >
      <h3 className="text-lg font-semibold text-text-main mb-4">Apply for Leave</h3>
      
      <div className="mb-4">
        <label className="block text-muted mb-2" htmlFor="reason">
          Reason
        </label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus-ring min-h-[100px]"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-muted mb-2" htmlFor="fromDate">
            From Date
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus-ring"
            required
          />
        </div>
        
        <div>
          <label className="block text-muted mb-2" htmlFor="toDate">
            To Date
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus-ring"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-2 disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Apply for Leave'}
      </button>
      
      {error && <p className="text-error mt-2">{error}</p>}
    </form>
  );
};

export default LeaveForm;