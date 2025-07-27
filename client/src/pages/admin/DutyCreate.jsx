import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  Briefcase, Plus, Check, X,
  Loader2, Calendar, AlertCircle,
  ChevronDown, FileText, Hash, AlertTriangle
} from 'lucide-react';

const DutyCreate = () => {
  const { 
    departments, 
    fetchDepartments,
    createDuty,
    loading,
    error 
  } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    deadline: '',
    priority: 'medium'
  });
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
    if (!formData.name.trim()) errors.name = 'Duty name is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.deadline) errors.deadline = 'Deadline is required';
    if (formData.name.length > 100) errors.name = 'Name too long (max 100 chars)';
    if (formData.description.length > 500) errors.description = 'Description too long (max 500 chars)';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await createDuty(formData);
      setFormData({
        name: '',
        description: '',
        department: '',
        deadline: '',
        priority: 'medium'
      });
    } catch (err) {
      console.error('Duty creation failed:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'bg-emerald-100 text-emerald-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Create New Duty</h1>
          </div>
          <p className="text-gray-600 ml-11">Assign duties to departments with custom requirements</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200/70 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Duty Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Duty Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
                placeholder="e.g. Monthly Report Submission"
              />
              <div className="flex justify-between">
                {validationErrors.name ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.name}
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">Max 100 characters</span>
                )}
                <span className={`text-xs ${
                  formData.name.length > 100 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {formData.name.length}/100
                </span>
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.description ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
                placeholder="Detailed instructions for this duty..."
              />
              <div className="flex justify-between">
                {validationErrors.description ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.description}
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">Max 500 characters</span>
                )}
                <span className={`text-xs ${
                  formData.description.length > 500 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Department & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Department Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-500" />
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                      validationErrors.department ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                {validationErrors.department && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.department}
                  </p>
                )}
              </div>

              {/* Priority Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-blue-500" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(formData.priority)}`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deadline Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.deadline ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                <Calendar size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
              </div>
              {validationErrors.deadline && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.deadline}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 rounded-xl border-l-4 border-red-500 flex items-start gap-2">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Submission Error</h4>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Create Duty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DutyCreate;