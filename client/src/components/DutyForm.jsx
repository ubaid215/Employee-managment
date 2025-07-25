import React, { useState } from 'react';
import { useDuty } from '../context/DutyContext';

const DutyForm = ({ duty }) => {
  const { submitTask, loading, error } = useDuty();
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitTask(duty._id, formData);
      setFormData({});
    } catch (err) {
      console.error('Task submission failed:', err);
    }
  };

  const fields = duty.formSchema?.fields || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-4 rounded-lg shadow-md w-full max-w-lg mx-auto"
    >
      <h3 className="text-lg font-semibold text-text-main mb-4">{duty.title}</h3>
      
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label className="block text-muted mb-2" htmlFor={field.name}>
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus-ring min-h-[100px]"
              required={field.required}
            />
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus-ring"
              required={field.required}
            />
          )}
        </div>
      ))}
      
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-2 disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Task'}
      </button>
      
      {error && <p className="text-error mt-2">{error}</p>}
    </form>
  );
};

export default DutyForm;