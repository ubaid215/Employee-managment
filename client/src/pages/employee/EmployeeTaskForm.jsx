import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useEmployee } from "../../context/EmployeeContext";
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
  List,
  Hash,
  Clock,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
  Clock3,
  Star
} from "lucide-react";

const fieldIcons = {
  text: <Type size={16} className="text-blue-500" />,
  textarea: <List size={16} className="text-blue-500" />,
  number: <Hash size={16} className="text-blue-500" />,
  date: <Calendar size={16} className="text-blue-500" />,
  datetime: <Clock size={16} className="text-blue-500" />,
  select: <ChevronsUpDown size={16} className="text-blue-500" />,
  radio: <ToggleRight size={16} className="text-blue-500" />,
  checkbox: <CheckSquare size={16} className="text-blue-500" />,
  email: <Mail size={16} className="text-blue-500" />,
  url: <Link size={16} className="text-blue-500" />,
  tel: <Phone size={16} className="text-blue-500" />,
  file: <Image size={16} className="text-blue-500" />,
  range: <Sliders size={16} className="text-blue-500" />,
};

const getDefaultValue = (field) => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case "checkbox":
      return [];
    case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return "";
  }
};

const EmployeeTaskForm = ({ dutyId: propDutyId }) => {
  const params = useParams();
  const urlDutyId = params.dutyId;
  
  const {
    fetchMyDuties,
    submitTask,
    myDuties = [],
    loading: empLoading,
    loadingStates,
  } = useEmployee();

  const [selectedDuty, setSelectedDuty] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFields, setExpandedFields] = useState({});
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [showDutySelector, setShowDutySelector] = useState(false);

  console.log('EmployeeTaskForm initialized with:', {
    propDutyId,
    urlDutyId,
    myDutiesCount: myDuties?.length || 0,
    empLoading,
    initialDataLoaded
  });

  // Fetch initial data
  useEffect(() => {
    if (initialDataLoaded || empLoading) return;

    const fetchInitialData = async () => {
      try {
        setSubmissionError(null);
        console.log('Fetching duties...');
        
        if (!fetchMyDuties) {
          throw new Error('fetchMyDuties function not available in context');
        }
        
        await fetchMyDuties(true);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Initial data fetch error:", error);
        setSubmissionError(error.message || "Failed to fetch duties");
        setInitialDataLoaded(true);
      }
    };

    fetchInitialData();
  }, [fetchMyDuties, initialDataLoaded, empLoading]);

  // Handle duty selection logic
  useEffect(() => {
    if (!initialDataLoaded || !myDuties || myDuties.length === 0) {
      return;
    }

    console.log('Processing duty selection:', {
      propDutyId,
      urlDutyId,
      myDutiesCount: myDuties.length,
      duties: myDuties.map(d => ({ id: d?.id || d?._id, title: d?.title }))
    });

    // Priority: URL param > prop > auto-select if single duty
    const targetDutyId = urlDutyId || propDutyId;

    if (targetDutyId) {
      // Try to find specific duty
      const foundDuty = myDuties.find(d => 
        d && (String(d.id) === String(targetDutyId) || String(d._id) === String(targetDutyId))
      );

      if (foundDuty) {
        console.log('Found specific duty:', foundDuty.title);
        selectDuty(foundDuty);
      } else {
        console.error(`Duty with ID ${targetDutyId} not found`);
        setSubmissionError(`Duty with ID ${targetDutyId} not found in ${myDuties.length} available duties`);
        setShowDutySelector(true);
      }
    } else {
      // No specific duty requested
      if (myDuties.length === 1) {
        // Auto-select single duty
        console.log('Auto-selecting single duty:', myDuties[0].title);
        selectDuty(myDuties[0]);
      } else {
        // Multiple duties - show selector
        console.log('Multiple duties available, showing selector');
        setShowDutySelector(true);
      }
    }
  }, [initialDataLoaded, myDuties, urlDutyId, propDutyId]);

  // Function to select a duty and initialize form
  const selectDuty = (duty) => {
    if (!duty || !duty.formSchema) {
      setSubmissionError('Selected duty has no form schema');
      return;
    }

    console.log('Selecting duty:', {
      id: duty.id || duty._id,
      title: duty.title,
      fieldsCount: duty.formSchema?.fields?.length || 0
    });

    setSelectedDuty(duty);
    setShowDutySelector(false);
    setSubmissionError(null);

    // Initialize form data
    const initialData = {};
    if (duty.formSchema?.fields) {
      duty.formSchema.fields.forEach(field => {
        initialData[field.name] = field.defaultValue || getDefaultValue(field);
      });
    }
    setFormData(initialData);
    setErrors({});

    // Load draft if exists
    const dutyId = duty.id || duty._id;
    const draftKey = `draft-${dutyId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draftData }));
        console.log('Loaded draft data');
      } catch (e) {
        console.warn('Failed to load draft:', e);
      }
    }
  };

  // Save draft periodically
  useEffect(() => {
    if (!selectedDuty || Object.keys(formData).length === 0) return;

    const dutyId = selectedDuty.id || selectedDuty._id;
    const draftKey = `draft-${dutyId}`;
    
    const saveDraft = () => {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedDuty]);

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field.name]);
    setErrors((prev) => ({ ...prev, [field.name]: error }));
  };

  const validateField = (field, value) => {
    if (
      field.required &&
      (value === "" || (Array.isArray(value) && value.length === 0))
    ) {
      return `${field.label || field.name} is required`;
    }

    if (field.validation) {
      switch (field.type) {
        case "email":
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Please enter a valid email address";
          }
          break;
        case "url":
          try {
            if (value) new URL(value);
          } catch {
            return "Please enter a valid URL";
          }
          break;
        case "number":
          if (value && isNaN(value)) {
            return "Please enter a valid number";
          }
          if (field.validation.min && Number(value) < field.validation.min) {
            return `Value must be at least ${field.validation.min}`;
          }
          if (field.validation.max && Number(value) > field.validation.max) {
            return `Value must be at most ${field.validation.max}`;
          }
          break;
        case "text":
        case "textarea":
          if (
            field.validation.minLength &&
            value.length < field.validation.minLength
          ) {
            return `Must be at least ${field.validation.minLength} characters`;
          }
          if (
            field.validation.maxLength &&
            value.length > field.validation.maxLength
          ) {
            return `Must be at most ${field.validation.maxLength} characters`;
          }
          break;
        case "date":
          if (value && field.validation.minDate && new Date(value) < new Date(field.validation.minDate)) {
            return `Date must be after ${new Date(
              field.validation.minDate
            ).toLocaleDateString()}`;
          }
          break;
      }
    }

    return null;
  };

  const toggleFieldExpand = (fieldName) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const shouldShowField = (field) => {
    if (!field.conditions) return true;
    return field.conditions.every((cond) => {
      const fieldValue = formData[cond.field];
      return (
        fieldValue === cond.value ||
        (Array.isArray(fieldValue) && fieldValue.includes(cond.value))
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDuty?.formSchema?.fields) return;

    const newErrors = {};
    let hasErrors = false;

    selectedDuty.formSchema.fields.forEach((field) => {
      if (!shouldShowField(field)) return;

      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    if (hasErrors) return;

    try {
      setIsSubmitting(true);
      const dutyId = selectedDuty.id || selectedDuty._id;
      await submitTask(dutyId, formData);

      // Clear form on success
      const initialData = {};
      selectedDuty.formSchema.fields.forEach((field) => {
        initialData[field.name] = getDefaultValue(field);
      });
      setFormData(initialData);
      setErrors({});

      // Clear draft
      localStorage.removeItem(`draft-${dutyId}`);

      // Show success state
      setIsSubmitting("success");
      setTimeout(() => setIsSubmitting(false), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionError(error.message || "Failed to submit task");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!selectedDuty?.formSchema?.fields) return;
    
    const initialData = {};
    selectedDuty.formSchema.fields.forEach((field) => {
      initialData[field.name] = getDefaultValue(field);
    });
    setFormData(initialData);
    setErrors({});
    setSubmissionError(null);
  };

  const renderField = (field) => {
    if (!shouldShowField(field)) return null;

    const error = errors[field.name];
    const value = formData[field.name] ?? getDefaultValue(field);
    const IconComponent = fieldIcons[field.type];
    const isExpanded = expandedFields[field.name] !== false;

    const baseClasses = `w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      error
        ? "border-red-500 bg-red-50/50"
        : "border-gray-200 hover:border-blue-300"
    }`;

    const fieldContainerClasses = `space-y-2 ${
      field.collapsible ? "border border-gray-200 rounded-lg p-4" : ""
    }`;

    return (
      <div key={field.name} className={fieldContainerClasses}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {IconComponent}
            {field.label || field.name}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.collapsible && (
            <button
              type="button"
              onClick={() => toggleFieldExpand(field.name)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>

        {isExpanded && (
          <>
            {renderFieldInput(field, value, baseClasses)}
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            {field.helpText && (
              <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
            )}
          </>
        )}
      </div>
    );
  };

  const renderFieldInput = (field, value, baseClasses) => {
    switch (field.type) {
      case "text":
      case "email":
      case "url":
      case "tel":
      case "number":
        return (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseClasses}
            placeholder={field.placeholder}
            rows={field.rows || 4}
          />
        );

      case "date":
      case "datetime":
        return (
          <input
            type={field.type === "datetime" ? "datetime-local" : "date"}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseClasses}
            min={field.validation?.minDate}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseClasses}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label || option.value}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...value, option.value]
                      : value.filter((v) => v !== option.value);
                    handleChange(field.name, newValue);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label || option.value}</span>
              </label>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label || option.value}</span>
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => handleChange(field.name, e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {value && (
              <span className="text-sm text-gray-600 truncate max-w-xs">
                {value.name || "File selected"}
              </span>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Loading state
  if (empLoading || loadingStates?.myDuties || !initialDataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <span className="text-gray-600">Loading duties...</span>
      </div>
    );
  }

  // No duties available
  if (initialDataLoaded && (!myDuties || myDuties.length === 0)) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">No Duties Assigned</h3>
            <p className="text-sm text-yellow-700 mt-2">
              You don't have any duties assigned to you yet. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show duty selector
  if (showDutySelector && myDuties.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select a Task to Complete</h2>
          <p className="text-gray-600 mt-1">Choose from your assigned duties</p>
        </div>
        
        <div className="p-6">
          {submissionError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{submissionError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {myDuties.map((duty) => (
              <div
                key={duty.id || duty._id}
                onClick={() => selectDuty(duty)}
                className="cursor-pointer p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {duty.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {duty.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>{duty.formSchema?.fields?.length || 0} fields</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          duty.priority === 'high' ? 'bg-red-100 text-red-800' :
                          duty.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {duty.priority} priority
                        </span>
                      </div>
                      
                      {duty.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock3 size={14} />
                          <span>{duty.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 text-blue-500 group-hover:text-blue-700 transition-colors">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show task form
  if (selectedDuty) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDuty.formSchema?.title || selectedDuty.title}
              </h2>
              {selectedDuty.formSchema?.description && (
                <p className="text-gray-600 mt-1.5">{selectedDuty.formSchema.description}</p>
              )}
            </div>
            
            {myDuties.length > 1 && (
              <button
                onClick={() => {
                  setSelectedDuty(null);
                  setShowDutySelector(true);
                  setFormData({});
                  setErrors({});
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
                Change Task
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {selectedDuty.formSchema?.fields?.map((field) => (
            <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
          ))}

          {submissionError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800">Submission Error</h3>
                  <p className="text-sm text-red-700 mt-1">{submissionError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-medium border-blue-800 text-gray-700 hover:bg-gray-100 transition-colors duration-200 "
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 overflow-hidden ${
                isSubmitting === "success"
                  ? "bg-green-100 text-green-800"
                  : isSubmitting
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm"
              }`}
            >
              {isSubmitting === "success" ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Submitted Successfully</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span>{selectedDuty.formSchema?.submitButtonText || "Submit Task"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Fallback
  return (
    <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-medium text-gray-800">No Task Selected</h3>
          <p className="text-sm text-gray-600 mt-2">
            Please select a task to continue or check your duty assignments.
          </p>
        </div>
      </div>
    </div>
  );
};

EmployeeTaskForm.propTypes = {
  dutyId: PropTypes.string
};

export default EmployeeTaskForm;