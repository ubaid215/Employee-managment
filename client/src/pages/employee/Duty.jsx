import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "../../context/EmployeeContext";
import {
  Briefcase,
  ClipboardList,
  Clock,
  Plus,
  Check,
  X,
  AlertCircle,
  Loader2,
  Edit,
  History,
  ArrowLeft,
  Star,
  Calendar,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

const Duty = () => {
  const { dutyId } = useParams();
  const navigate = useNavigate();
  const {
    duties,
    fetchMyDuties,
    submitTask,
    fetchDutyHistory,
    dutyHistory,
    loading,
  } = useEmployee();

  const [activeTab, setActiveTab] = useState("current");
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDuty = duties.find((d) => d._id === dutyId) || {};
  const filteredHistory = (dutyHistory || []).filter(
    (task) => task.duty === dutyId
  );

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      try {
        if (!duties.length) {
          await fetchMyDuties();
        }

        if (!didCancel) {
          await fetchDutyHistory();
        }
      } catch (err) {
        console.error("Failed to fetch duty data:", err);
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [dutyId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs differently
    const inputValue = type === 'checkbox' 
      ? checked 
      : type === 'file'
        ? e.target.files[0]
        : value;

    setFormData(prev => ({ 
      ...prev, 
      [name]: inputValue 
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!currentDuty.formSchema?.fields) return { isValid: true, errors };

    currentDuty.formSchema.fields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields
      if (field.required && (value === undefined || value === '' || value === null)) {
        errors[field.name] = field.validation?.customMessage || `${field.label} is required`;
        isValid = false;
        return;
      }

      // Skip validation if field is not required and empty
      if (!field.required && (value === undefined || value === '' || value === null)) {
        return;
      }

      // Type-specific validation
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be a valid email address`;
            isValid = false;
          }
          break;
          
        case 'url':
          try {
            new URL(value);
          } catch {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be a valid URL`;
            isValid = false;
          }
          break;
          
        case 'number':
          if (isNaN(value)) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be a number`;
            isValid = false;
          } else {
            const numValue = Number(value);
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors[field.name] = field.validation?.customMessage || `${field.label} must be at least ${field.validation.min}`;
              isValid = false;
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors[field.name] = field.validation?.customMessage || `${field.label} must be at most ${field.validation.max}`;
              isValid = false;
            }
          }
          break;
          
        case 'text':
        case 'textarea':
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be at least ${field.validation.minLength} characters`;
            isValid = false;
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be at most ${field.validation.maxLength} characters`;
            isValid = false;
          }
          if (field.validation?.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(value)) {
              errors[field.name] = field.validation?.customMessage || `${field.label} format is invalid`;
              isValid = false;
            }
          }
          break;
          
        case 'select':
        case 'radio':
          const validOptions = field.options.map(opt => opt.value);
          if (!validOptions.includes(value)) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be one of: ${validOptions.join(', ')}`;
            isValid = false;
          }
          break;
          
        case 'checkbox':
          if (!Array.isArray(value)) {
            errors[field.name] = field.validation?.customMessage || `${field.label} must be an array`;
            isValid = false;
          } else {
            const validOptions = field.options.map(opt => opt.value);
            const invalidValues = value.filter(v => !validOptions.includes(v));
            if (invalidValues.length > 0) {
              errors[field.name] = field.validation?.customMessage || `${field.label} contains invalid options: ${invalidValues.join(', ')}`;
              isValid = false;
            }
          }
          break;
      }
    });

    setValidationErrors(errors);
    return { isValid, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid } = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await submitTask(dutyId, formData);
      setFormData({});
      fetchDutyHistory(); // Refresh history
    } catch (err) {
      console.error("Submission failed:", err);
      setValidationErrors({ 
        submit: err.response?.data?.message || 'Failed to submit. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field) => {
    const error = validationErrors[field.name];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'password':
      case 'search':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              rows={4}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'number':
      case 'range':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.type === 'range' ? 'any' : undefined}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'date':
      case 'datetime-local':
      case 'time':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              />
              <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleSelectChange(field.name, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                  error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                }`}
              >
                <option value="">{field.placeholder || 'Select an option'}</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={formData[field.name] === option.value}
                    onChange={() => handleSelectChange(field.name, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={`${field.name}-${option.value}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          return (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field.options?.map(option => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${field.name}-${option.value}`}
                      name={field.name}
                      value={option.value}
                      checked={formData[field.name]?.includes(option.value) || false}
                      onChange={(e) => {
                        const value = option.value;
                        const currentValues = formData[field.name] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, value]
                          : currentValues.filter(v => v !== value);
                        handleSelectChange(field.name, newValues);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`${field.name}-${option.value}`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
              )}
              {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div key={field.name} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={field.name} className="font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                )}
                {error && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>
            </div>
          );
        }
      
      case 'file':
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
              error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
            }`}>
              <input
                type="file"
                name={field.name}
                onChange={handleInputChange}
                className="hidden"
                id={`file-upload-${field.name}`}
              />
              <label
                htmlFor={`file-upload-${field.name}`}
                className="cursor-pointer"
              >
                <p className="text-sm text-gray-500">
                  {formData[field.name]?.name || 'Drag & drop files here or click to browse'}
                </p>
                {formData[field.name] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected: {formData[field.name].name}
                  </p>
                )}
              </label>
            </div>
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
      
      default:
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";

    switch (status) {
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <X size={14} />
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock size={14} />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentDuty.title || "Duty Details"}
          </h1>
        </div>

        {/* Duty Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase size={20} className="text-blue-500" />
                {currentDuty.title}
              </h2>
              <p className="text-gray-600 mt-1">{currentDuty.description}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClipboardList size={16} />
                  <span>Form fields: {currentDuty.fieldCount || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>
                    Priority:{" "}
                    <span className="capitalize">{currentDuty.priority || "medium"}</span>
                  </span>
                </div>
                {currentDuty.estimatedTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Estimated: ~{currentDuty.estimatedTime} minutes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("current")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ClipboardList size={16} />
                Current Tasks
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <History size={16} />
                History
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {currentDuty.formSchema?.title || "Task Submission Form"}
              </h3>
              
              {currentDuty.formSchema?.description && (
                <p className="text-sm text-gray-500 mb-4">
                  {currentDuty.formSchema.description}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {currentDuty.formSchema?.fields?.map(field => (
                  renderFormField(field)
                ))}

                {validationErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {validationErrors.submit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {currentDuty.formSchema?.submitButtonText || "Submit"}
                </button>
              </form>
            </div>
          </div>

          {/* Tasks History Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {activeTab === "history" ? (
                    <>
                      <History size={20} className="text-blue-500" />
                      Submission History
                    </>
                  ) : (
                    <>
                      <ClipboardList size={20} className="text-green-500" />
                      Recent Submissions
                    </>
                  )}
                </h3>
              </div>

              {loading && !filteredHistory.length ? (
                <div className="p-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle
                    size={40}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p>
                    No {activeTab === "history" ? "submissions" : "tasks"} found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Details
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Feedback
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {task.description || "Task submission"}
                            </div>
                            {task.notes && (
                              <div className="text-sm text-gray-500 mt-1">
                                {task.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {task.feedback ? (
                              <div className="flex items-center gap-1">
                                <Star
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                                <span>{task.feedback}</span>
                              </div>
                            ) : (
                              "No feedback yet"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Duty;