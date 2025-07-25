import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getAllDepartments, getAllDuties, assignDepartmentAndDuties } from '../services/adminService';

const DepartmentChangeModal = ({ isOpen, onClose, employeeId }) => {
  const { user } = useUser();
  const [departments, setDepartments] = useState([]);
  const [duties, setDuties] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: '',
    dutyIds: [],
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      const fetchData = async () => {
        try {
          const [deptResponse, dutyResponse] = await Promise.all([
            getAllDepartments(),
            getAllDuties(),
          ]);
          setDepartments(deptResponse);
          setDuties(dutyResponse);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchData();
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDutyChange = (e) => {
    const selectedDuties = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, dutyIds: selectedDuties }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignDepartmentAndDuties(employeeId, formData.departmentId, formData.dutyIds, formData.reason);
      onClose();
      setFormData({ departmentId: '', dutyIds: [], reason: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || user?.role !== 'admin') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-text-main mb-4">Assign Department & Duties</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-muted mb-2" htmlFor="departmentId">
              Department
            </label>
            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus-ring"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-muted mb-2" htmlFor="dutyIds">
              Duties
            </label>
            <select
              id="dutyIds"
              name="dutyIds"
              multiple
              value={formData.dutyIds}
              onChange={handleDutyChange}
              className="w-full p-2 border rounded-md focus-ring min-h-[120px]"
            >
              {duties.map((duty) => (
                <option key={duty._id} value={duty._id}>
                  {duty.title}
                </option>
              ))}
            </select>
          </div>
          
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
          
          {error && <p className="text-error mb-4">{error}</p>}
          
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2 disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentChangeModal;