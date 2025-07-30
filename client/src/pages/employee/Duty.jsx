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
  ChevronRight,
  FileText,
} from "lucide-react";

const Duty = () => {
  const { dutyId } = useParams();
  const navigate = useNavigate();
  const {
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
  const { myDuties } = useEmployee();
  const currentDuty =
    myDuties.find((d) => d.id === dutyId || d._id === dutyId) || {};

  const filteredHistory = Array.isArray(dutyHistory)
    ? dutyHistory.filter((task) => task.duty === dutyId)
    : [];

  useEffect(() => {
  let didCancel = false;

  const fetchData = async () => {
    try {
      if (!myDuties.length) {
        await fetchMyDuties(true); // force to avoid stale cache
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

    const inputValue =
      type === "checkbox"
        ? checked
        : type === "file"
        ? e.target.files[0]
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!currentDuty || !currentDuty._id) {
  return (
    <div className="p-8 text-center">
      <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
      <p className="text-slate-600 mt-2">Loading duty details...</p>
    </div>
  );
}


    currentDuty.formSchema.fields.forEach((field) => {
      const value = formData[field.name];

      if (
        field.required &&
        (value === undefined || value === "" || value === null)
      ) {
        errors[field.name] =
          field.validation?.customMessage || `${field.label} is required`;
        isValid = false;
        return;
      }

      if (
        !field.required &&
        (value === undefined || value === "" || value === null)
      ) {
        return;
      }

      // ... (keep existing validation logic)
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
      fetchDutyHistory();
    } catch (err) {
      console.error("Submission failed:", err);
      setValidationErrors({
        submit:
          err.response?.data?.message || "Failed to submit. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field) => {
    const error = validationErrors[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "url":
      case "tel":
      case "password":
      case "search":
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );

      // ... (keep other field type renderings with updated classNames)

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
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
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5";

    switch (status) {
      case "approved":
        return (
          <span className={`${baseClasses} bg-emerald-100 text-emerald-800`}>
            <CheckCircle size={14} className="text-emerald-500" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <X size={14} className="text-red-500" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
            <Clock size={14} className="text-amber-500" />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-slate-100 text-slate-800`}>
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {currentDuty.title || "Duty Details"}
          </h1>
        </div>

        {/* Duty Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200/60 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <Briefcase size={20} className="text-white" />
                </div>
                <span className="text-slate-800">{currentDuty.title}</span>
              </h2>
              <p className="text-slate-600 mt-2">{currentDuty.description}</p>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <ClipboardList size={16} className="text-blue-500" />
                  <span>Form fields: {currentDuty.fieldCount || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Clock size={16} className="text-amber-500" />
                  <span>
                    Priority:{" "}
                    <span className="capitalize font-medium">
                      {currentDuty.priority || "medium"}
                    </span>
                  </span>
                </div>
                {currentDuty.estimatedTime && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <Clock size={16} className="text-emerald-500" />
                    <span>Estimated: ~{currentDuty.estimatedTime} minutes</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("current")}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === "current"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <ClipboardList size={16} />
                Current Tasks
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <span className="text-slate-800">
                  {currentDuty.formSchema?.title || "Task Submission Form"}
                </span>
              </h3>

              {currentDuty.formSchema?.description && (
                <p className="text-sm text-slate-500 mb-4">
                  {currentDuty.formSchema.description}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {currentDuty.formSchema?.fields?.map((field) =>
                  renderFormField(field)
                )}

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
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {currentDuty.formSchema?.submitButtonText || "Submit Task"}
                </button>
              </form>
            </div>
          </div>

          {/* Tasks History Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <h3 className="text-lg font-semibold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    {activeTab === "history" ? (
                      <History size={20} className="text-white" />
                    ) : (
                      <ClipboardList size={20} className="text-white" />
                    )}
                  </div>
                  <span className="text-slate-800">
                    {activeTab === "history"
                      ? "Submission History"
                      : "Recent Submissions"}
                  </span>
                </h3>
              </div>

              {loading && !filteredHistory.length ? (
                <div className="p-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle
                    size={40}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  <p className="text-slate-500">
                    No {activeTab === "history" ? "submissions" : "tasks"} found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredHistory.map((task) => (
                    <div
                      key={task._id}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar
                              size={16}
                              className="text-slate-500 flex-shrink-0"
                            />
                            <span className="text-sm text-slate-500">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                            <div className="hidden md:block">
                              {getStatusBadge(task.status)}
                            </div>
                          </div>

                          <h4 className="text-base font-medium text-slate-800">
                            {task.description || "Task submission"}
                          </h4>

                          {task.notes && (
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {task.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="md:hidden">
                            {getStatusBadge(task.status)}
                          </div>

                          {task.feedback && (
                            <div className="flex items-center gap-1 text-sm bg-slate-50 px-3 py-1 rounded-full">
                              <Star
                                size={14}
                                className="text-amber-400 fill-amber-400"
                              />
                              <span className="text-slate-700">
                                {task.feedback}
                              </span>
                            </div>
                          )}

                          <button className="text-slate-400 hover:text-slate-600">
                            <ChevronRight size={18} />
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
      </div>
    </div>
  );
};

export default Duty;
