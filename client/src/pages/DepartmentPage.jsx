import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { createDepartment, getAllDepartments } from '../services/adminService';
import { Link } from 'react-router-dom';

const DepartmentPage = () => {
  const { user } = useUser();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchDepartments = async () => {
        setLoading(true);
        try {
          const data = await getAllDepartments();
          setDepartments(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDepartments();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createDepartment(formData.name);
      setDepartments((prev) => [...prev, response.department]);
      setFormData({ name: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') return <p className="text-error text-center p-4">Access Denied</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Department Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Create Department</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-muted mb-2" htmlFor="name">
                  Department Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus-ring"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2 disabled:opacity-60"
              >
                {loading ? 'Creating...' : 'Create Department'}
              </button>
            </form>
            {error && <p className="text-error mt-2 text-sm">{error}</p>}
          </div>
        </div>

        {/* Department List Card */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-text-main">Department List</h2>
          </div>
          <div className="p-4">
            {loading && <p className="text-primary text-center">Loading...</p>}
            {departments.length === 0 && !loading ? (
              <p className="text-muted text-center">No departments found.</p>
            ) : (
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between p-3 hover:bg-bg-light rounded-lg transition-colors">
                    <span className="font-medium text-text-main">{dept.name}</span>
                    <Link
                      to={`/department-history/${dept._id}`}
                      className="text-sm btn-secondary px-3 py-1"
                    >
                      View History
                    </Link>
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

export default DepartmentPage;