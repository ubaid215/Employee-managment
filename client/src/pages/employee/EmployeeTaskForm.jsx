import React, { useState, useEffect } from 'react';
import { useEmployee } from '../context/EmployeeContext';
import {
  Calendar,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
  CheckSquare,
  ChevronsUpDown,
  Image,
  Mail,
  Link,
  Phone,
  Sliders,
  Type,
  List
} from 'lucide-react';

const fieldIcons = {
  text: <Type size={16} />,
  textarea: <List size={16} />,
  number: <Hash size={16} />,
  date: <Calendar size={16} />,
  datetime: <Clock size={16} />,
  select: <ChevronsUpDown size={16} />,
  radio: <ToggleRight size={16} />,
  checkbox: <CheckSquare size={16} />,
  email: <Mail size={16} />,
  url: <Link size={16} />,
  tel: <Phone size={16} />,
  file: <Image size={16} />,
  range: <Sliders size={16} />
};

const EmployeeTaskForm = ({ taskId, dutyId }) => {
  const { getDutyFormSchema, submitTask } = useEmployee();
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        setLoading(true);
        const schema = await getDutyFormSchema(dutyId);
        setFormSchema(schema);
        
        // Initialize form data with default values
        const initialData = {};
        schema.fields.forEach(field => {
          initialData[field.name] = field.defaultValue || '';
        });
        setFormData(initialData);
      } catch (error) {
        console.error('Failed to load form schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormSchema();
  }, [dutyId, getDutyFormSchema]);

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateField = (field, value) => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    switch (field.type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'url':
        try {
          if (value) new URL(value);
        } catch {
          return 'Please enter a valid URL';
        }
        break;
      case 'number':
        if (isNaN(value)) {
          return 'Please enter a valid number';
        }
        if (field.validation?.min && Number(value) < field.validation.min) {
          return `Value must be at least ${field.validation.min}`;
        }
        if (field.validation?.max && Number(value) > field.validation.max) {
          return `Value must be at most ${field.validation.max}`;
        }
        break;
      case 'text':
      case 'textarea':
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return `Must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return `Must be at most ${field.validation.maxLength} characters`;
        }
        break;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    formSchema.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    try {
      setLoading(true);
      await submitTask(taskId, formData);
      // Handle successful submission (e.g., show success message, redirect)
    } catch (error) {
      setSubmissionError(error.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const error = errors[field.name];
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'number':
        return (
          <div className="space-y-1">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons[field.type]}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {field.helpText && (
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-1">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.textarea}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-1">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.select}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.checkbox}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.name}-${option.value}`}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        newValue.push(option.value);
                      } else {
                        const index = newValue.indexOf(option.value);
                        if (index > -1) newValue.splice(index, 1);
                      }
                      handleChange(field.name, newValue);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`${field.name}-${option.value}`} className="ml-2  text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.radio}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`${field.name}-${option.value}`} className="ml-2  text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      case 'date':
      case 'datetime':
        return (
          <div className="space-y-1">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.date}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'datetime' ? 'datetime-local' : 'date'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-1">
            <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
              {fieldIcons.file}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              onChange={(e) => handleChange(field.name, e.target.files[0])}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading && !formSchema) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!formSchema) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load task form. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{formSchema.title}</h2>
        {formSchema.description && (
          <p className="text-gray-600 mt-1">{formSchema.description}</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {formSchema.fields.map((field) => (
          <div key={field.name}>
            {renderField(field)}
          </div>
        ))}
        
        {submissionError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {submissionError}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Submit Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeTaskForm;