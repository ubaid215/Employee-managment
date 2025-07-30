import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Briefcase, Plus, Check, X,
  Loader2, Calendar, AlertCircle,
  ChevronDown, FileText, Hash, AlertTriangle,
  List, Type, CheckSquare, ChevronsUpDown,
  CalendarDays, Clock, Mail, Link, Phone,
  Sliders, Image, Percent, ToggleRight,
  Edit, Trash2, Search
} from 'lucide-react';

const fieldTypes = [
  { value: 'text', label: 'Text Input', icon: <Type size={16} /> },
  { value: 'textarea', label: 'Text Area', icon: <List size={16} /> },
  { value: 'number', label: 'Number', icon: <Hash size={16} /> },
  { value: 'date', label: 'Date', icon: <CalendarDays size={16} /> },
  { value: 'datetime', label: 'Date & Time', icon: <Clock size={16} /> },
  { value: 'select', label: 'Dropdown', icon: <ChevronsUpDown size={16} /> },
  { value: 'radio', label: 'Radio Buttons', icon: <ToggleRight size={16} /> },
  { value: 'checkbox', label: 'Checkboxes', icon: <CheckSquare size={16} /> },
  { value: 'email', label: 'Email', icon: <Mail size={16} /> },
  { value: 'url', label: 'URL', icon: <Link size={16} /> },
  { value: 'tel', label: 'Phone', icon: <Phone size={16} /> },
  { value: 'range', label: 'Range Slider', icon: <Sliders size={16} /> },
  { value: 'file', label: 'File Upload', icon: <Image size={16} /> },
  { value: 'color', label: 'Color Picker', icon: <Percent size={16} /> }
];

const DutyCreate = () => {
  const {
    departments,
    fetchDepartments,
    createDuty,
    loading,
    duties,
    fetchDuties,
    updateDuty,
    deleteDuty,
    error,
  } = useAdmin();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    deadline: '',
    priority: 'medium',
    estimatedTime: '',
    tags: [],
    formSchema: {
      title: '',
      description: '',
      fields: [],
      submitButtonText: 'Submit',
      allowMultipleSubmissions: true,
      submissionLimit: null
    }
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    label: '',
    required: false,
    placeholder: '',
    options: [{ label: '', value: '' }]
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [editingDuty, setEditingDuty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchDuties();
  }, [fetchDepartments, fetchDuties]);

  const filteredDuties = duties.filter(duty =>
    duty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    duty.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditDuty = (duty) => {
    setEditingDuty(duty);
    setFormData({
      title: duty.title,
      description: duty.description,
      department: duty.department?._id || duty.department,
      deadline: duty.deadline ? new Date(duty.deadline).toISOString().split('T')[0] : '',
      priority: duty.priority || 'medium',
      estimatedTime: duty.estimatedTime || '',
      tags: duty.tags || [],
      formSchema: duty.formSchema || {
        title: '',
        description: '',
        fields: [],
        submitButtonText: 'Submit',
        allowMultipleSubmissions: true,
        submissionLimit: null
      }
    });
    setViewMode('create');
    setActiveTab('basic');
  };

  const handleUpdateDuty = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateDuty(editingDuty._id, formData);
      setEditingDuty(null);
      setViewMode('list');
      setFormData({
        title: '',
        description: '',
        department: '',
        deadline: '',
        priority: 'medium',
        estimatedTime: '',
        tags: [],
        formSchema: {
          title: '',
          description: '',
          fields: [],
          submitButtonText: 'Submit',
          allowMultipleSubmissions: true,
          submissionLimit: null
        }
      });
    } catch (err) {
      console.error('Duty update failed:', err);
    }
  };

  const handleDeleteDuty = async (id) => {
    if (window.confirm('Are you sure you want to delete this duty?')) {
      try {
        await deleteDuty(id);
      } catch (err) {
        console.error('Duty deletion failed:', err);
      }
    }
  };

  const cancelEdit = () => {
    setEditingDuty(null);
    setViewMode('list');
    setFormData({
      title: '',
      description: '',
      department: '',
      deadline: '',
      priority: 'medium',
      estimatedTime: '',
      tags: [],
      formSchema: {
        title: '',
        description: '',
        fields: [],
        submitButtonText: 'Submit',
        allowMultipleSubmissions: true,
        submissionLimit: null
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('formSchema.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFieldInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, key, value) => {
    const updatedOptions = [...newField.options];
    updatedOptions[index][key] = value;
    setNewField(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const addOption = () => {
    setNewField(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const removeOption = (index) => {
    const updatedOptions = newField.options.filter((_, i) => i !== index);
    setNewField(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const addField = () => {
    const errors = {};
    if (!newField.name.trim()) errors.name = 'Field name is required';
    if (!newField.label.trim()) errors.label = 'Label is required';

    if (['select', 'radio', 'checkbox'].includes(newField.type)) {
      const hasEmptyOptions = newField.options.some(opt => !opt.label.trim() || !opt.value.trim());
      if (hasEmptyOptions) errors.options = 'All options must have label and value';

      if (newField.options.length < 1) {
        errors.options = 'At least one option is required';
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fieldToAdd = {
      name: newField.name.trim(),
      type: newField.type,
      label: newField.label.trim(),
      required: newField.required,
      placeholder: newField.placeholder.trim(),
      ...(newField.placeholder && { placeholder: newField.placeholder.trim() }),
      ...(['select', 'radio', 'checkbox'].includes(newField.type) && {
        options: newField.options.map(opt => ({
          label: opt.label.trim(),
          value: opt.value.trim()
        }))
      })
    };

    setFormData(prev => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: [...prev.formSchema.fields, fieldToAdd]
      }
    }));

    setNewField({
      name: '',
      type: 'text',
      label: '',
      required: false,
      placeholder: '',
      options: [{ label: '', value: '' }]
    });
  };

  const removeField = (index) => {
    setFormData(prev => {
      const updatedFields = [...prev.formSchema.fields];
      updatedFields.splice(index, 1);
      return {
        ...prev,
        formSchema: {
          ...prev.formSchema,
          fields: updatedFields
        }
      };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Duty title is required';
    if (!formData.department) errors.department = 'Department is required';
    if (formData.title.length > 100) errors.title = 'Name too long (max 100 chars)';
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
        title: '',
        description: '',
        department: '',
        deadline: '',
        priority: 'medium',
        estimatedTime: '',
        tags: [],
        formSchema: {
          title: '',
          description: '',
          fields: [],
          submitButtonText: 'Submit',
          allowMultipleSubmissions: true,
          submissionLimit: null
        }
      });
      setViewMode('list');
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
      <div className="max-w-4xl mx-auto">
        {viewMode === 'list' ? (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Manage Duties</h1>
              </div>
              <p className="text-gray-600 ml-11">View and manage all department duties</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200/70 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search duties by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setViewMode('create')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus size={18} />
                  Create New Duty
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
              ) : filteredDuties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No duties match your search' : 'No duties found'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDuties.map((duty) => (
                    <div key={duty._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <h3 className="font-semibold text-gray-800">{duty.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(duty.priority)}`}>
                              {duty.priority.charAt(0).toUpperCase() + duty.priority.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{duty.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {duty.department && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                                <Briefcase size={12} />
                                {duty.department.name || duty.department}
                              </span>
                            )}
                            {duty.deadline && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Calendar size={12} />
                                Due: {new Date(duty.deadline).toLocaleDateString()}
                              </span>
                            )}
                            {duty.estimatedTime && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                <Clock size={12} />
                                {duty.estimatedTime} mins
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditDuty(duty)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteDuty(duty._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
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
        ) : (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {editingDuty ? 'Edit Duty' : 'Create New Duty'}
                </h1>
              </div>
              <p className="text-gray-600 ml-11">
                {editingDuty ? 'Update duty details' : 'Assign duties to departments with custom requirements'}
              </p>
            </div>

            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Information
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('form')}
              >
                Custom Form Fields
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200/70 backdrop-blur-sm">
              <form onSubmit={editingDuty ? handleUpdateDuty : handleSubmit} className="space-y-5">
                {activeTab === 'basic' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        Duty Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.title ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                        }`}
                        placeholder="e.g. Monthly Report Submission"
                      />
                      <div className="flex justify-between">
                        {validationErrors.title ? (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {validationErrors.title}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">Max 100 characters</span>
                        )}
                        <span className={`text-xs ${
                          formData.title.length > 100 ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {formData.title.length}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar size={16} className="text-blue-500" />
                          Deadline
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

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Clock size={16} className="text-blue-500" />
                          Estimated Time (minutes)
                        </label>
                        <input
                          type="number"
                          name="estimatedTime"
                          value={formData.estimatedTime}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        Submission Form Title
                      </label>
                      <input
                        type="text"
                        name="formSchema.title"
                        value={formData.formSchema.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Monthly Report Submission Form"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        Submission Form Description
                      </label>
                      <textarea
                        name="formSchema.description"
                        value={formData.formSchema.description}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Instructions for completing this form..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <List size={18} className="text-blue-500" />
                          Custom Form Fields
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Add fields that employees will fill when submitting this duty
                        </p>
                      </div>

                      {formData.formSchema.fields.length > 0 ? (
                        <div className="space-y-4">
                          {formData.formSchema.fields.map((field, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-800">
                                    {field.label || 'Unnamed Field'}
                                    <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                      {field.type}
                                    </span>
                                    {field.required && (
                                      <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                                        Required
                                      </span>
                                    )}
                                  </h4>
                                  {field.name && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Field name: <code className="bg-gray-200 px-1 rounded">{field.name}</code>
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeField(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                          <p className="text-gray-500">No custom fields added yet</p>
                        </div>
                      )}

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                          <Plus size={16} className="text-blue-500" />
                          Add New Field
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Field Name (ID)</label>
                            <input
                              type="text"
                              name="name"
                              value={newField.name}
                              onChange={handleFieldInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                fieldErrors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                              }`}
                              placeholder="e.g. report_file"
                            />
                            {fieldErrors.name && (
                              <p className="text-xs text-red-600">{fieldErrors.name}</p>
                            )}
                            <p className="text-xs text-gray-500">Used internally (no spaces, lowercase)</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Field Type</label>
                            <select
                              name="type"
                              value={newField.type}
                              onChange={handleFieldInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Label</label>
                            <input
                              type="text"
                              name="label"
                              value={newField.label}
                              onChange={handleFieldInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                fieldErrors.label ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                              }`}
                              placeholder="e.g. Upload Report"
                            />
                            {fieldErrors.label && (
                              <p className="text-xs text-red-600">{fieldErrors.label}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Placeholder (optional)</label>
                            <input
                              type="text"
                              name="placeholder"
                              value={newField.placeholder}
                              onChange={handleFieldInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g. Select an option..."
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center">
                          <input
                            type="checkbox"
                            name="required"
                            id="required"
                            checked={newField.required}
                            onChange={handleFieldInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                            Required Field
                          </label>
                        </div>

                        {['select', 'radio', 'checkbox'].includes(newField.type) && (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700">Options</label>
                              {fieldErrors.options && (
                                <p className="text-xs text-red-600">{fieldErrors.options}</p>
                              )}
                            </div>

                            {newField.options.map((option, index) => (
                              <div key={index} className="grid grid-cols-2 gap-2 items-center">
                                <div>
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Display text"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Stored value"
                                  />
                                  {newField.options.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeOption(index)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={addOption}
                              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Plus size={14} />
                              Add Option
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={addField}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Field
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-4">
                  {activeTab === 'form' ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('basic')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <ChevronDown size={18} className="transform rotate-90" />
                      Back to Basic Info
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={editingDuty ? cancelEdit : () => window.history.back()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <X size={18} />
                      {editingDuty ? 'Cancel' : 'Back'}
                    </button>
                  )}

                  <div className="flex gap-3">
                    {activeTab === 'basic' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('form')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Continue to Form Fields
                        <ChevronDown size={18} className="transform -rotate-90" />
                      </button>
                    )}

                    {activeTab === 'form' && (
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
                        {editingDuty ? 'Update Duty' : 'Create Duty'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DutyCreate;