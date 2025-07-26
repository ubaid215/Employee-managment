import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmployee } from '../../context/EmployeeContext';
import { 
  Briefcase, ClipboardList, Clock, Plus, 
  Check, X, AlertCircle, Loader2, 
  Edit, History, ArrowLeft, Star
} from 'lucide-react';

const Duty = () => {
  const { dutyId } = useParams();
  const navigate = useNavigate();
  const { 
    duties, 
    fetchMyDuties, 
    submitTask, 
    fetchDutyHistory,
    dutyHistory,
    loading 
  } = useEmployee();
  
  const [activeTab, setActiveTab] = useState('current');
  const [formData, setFormData] = useState({});
  const [taskForm, setTaskForm] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const currentDuty = duties.find(d => d._id === dutyId) || {};
  const filteredHistory = dutyHistory.filter(task => task.duty === dutyId);

  useEffect(() => {
    if (!duties.length) {
      fetchMyDuties();
    }
    fetchDutyHistory();
  }, [dutyId, fetchMyDuties, fetchDutyHistory, duties.length]);

  const handleDutySubmit = (e) => {
    e.preventDefault();
    // Validate and submit entire duty
    console.log('Submitting entire duty:', formData);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    const errors = {};
    if (!taskForm.description) errors.description = 'Description is required';
    if (!taskForm.notes) errors.notes = 'Notes are required';
    
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await submitTask(dutyId, taskForm);
      setTaskForm({});
      fetchDutyHistory(); // Refresh history
    } catch (err) {
      console.error('Task submission failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
          <h1 className="text-2xl font-bold text-gray-900">{currentDuty.name || 'Duty Details'}</h1>
        </div>

        {/* 1. Duty Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase size={20} className="text-blue-500" />
                {currentDuty.name}
              </h2>
              <p className="text-gray-600 mt-1">{currentDuty.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Due: {new Date(currentDuty.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClipboardList size={16} />
                  <span>Tasks submitted: {filteredHistory.length}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'current' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClipboardList size={16} />
                Current Tasks
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <History size={16} />
                History
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2. Duty Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {activeTab === 'current' ? (
                  <>
                    <Plus size={20} className="text-green-500" />
                    Add New Task
                  </>
                ) : (
                  <>
                    <Edit size={20} className="text-blue-500" />
                    Submit Duty
                  </>
                )}
              </h3>

              {activeTab === 'current' ? (
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={taskForm.description || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="What needs to be done?"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={taskForm.notes || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.notes ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Additional details..."
                    />
                    {validationErrors.notes && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.notes}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Drag & drop files here or click to browse</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Submit Task
                  </button>
                </form>
              ) : (
                <form onSubmit={handleDutySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Report
                    </label>
                    <textarea
                      name="finalReport"
                      value={formData.finalReport || ''}
                      onChange={(e) => setFormData({...formData, finalReport: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Summarize your work on this duty..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lessons Learned
                    </label>
                    <textarea
                      name="lessonsLearned"
                      value={formData.lessonsLearned || ''}
                      onChange={(e) => setFormData({...formData, lessonsLearned: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What did you learn from this duty?"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Submit Duty
                    </button>
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* 3. Tasks History Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {activeTab === 'history' ? (
                    <>
                      <History size={20} className="text-blue-500" />
                      Duty Submission History
                    </>
                  ) : (
                    <>
                      <ClipboardList size={20} className="text-green-500" />
                      Task History
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
                  <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
                  <p>No {activeTab === 'history' ? 'duty submissions' : 'tasks'} found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <div className="text-sm font-medium text-gray-900">{task.description}</div>
                            {task.notes && (
                              <div className="text-sm text-gray-500 mt-1">{task.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(task.status)}>
                              {task.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {task.feedback ? (
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                <span>{task.feedback}</span>
                              </div>
                            ) : (
                              'No feedback yet'
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