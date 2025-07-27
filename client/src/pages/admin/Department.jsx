import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Briefcase, Plus, Edit, Trash2, 
  Check, X, Loader2, ChevronDown,
  BarChart2, Users, Clock
} from 'lucide-react';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Department = () => {
  const { 
    departments, 
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    loading,
    error 
  } = useAdmin();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Department name is required';
    if (formData.name.length > 50) errors.name = 'Name too long (max 50 chars)';
    if (formData.description.length > 200) errors.description = 'Description too long (max 200 chars)';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      await createDepartment(formData);
      setIsCreating(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Department creation failed:', err);
    }
  };

  const handleUpdate = async (id) => {
    if (!validateForm()) return;
    
    try {
      await updateDepartment(id, formData);
      setEditingId(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Department update failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error('Department deletion failed:', err);
      }
    }
  };

  // Prepare chart data
  const departmentStats = departments.map(dept => ({
    name: dept.name,
    value: dept.employeeCount || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600">Create and manage departments</p>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setFormData({ name: '', description: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Department' : 'Create New Department'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Marketing, Engineering, etc."
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the department"
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Department Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart2 size={20} className="text-blue-500" />
            Department Analytics
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase size={20} className="text-blue-500" />
              All Departments
            </h2>
          </div>
          
          {loading && !departments.length ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : departments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No departments found. Create your first department.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {departments.map(dept => (
                <div key={dept._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{dept.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users size={14} />
                          <span>{dept.employeeCount || 0} employees</span>
                        </div>
                      </div>
                      {dept.description && (
                        <p className="text-gray-600 mt-1">{dept.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingId(dept._id);
                          setIsCreating(false);
                          setFormData({
                            name: dept.name,
                            description: dept.description || ''
                          });
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept._id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Department;