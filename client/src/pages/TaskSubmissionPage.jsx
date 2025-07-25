import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTask } from '../../services/taskService';

const TaskSubmissionPage = () => {
  const [formData, setFormData] = useState({
    taskId: '',
    description: '',
    attachments: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachments: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await submitTask(formData);
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-md mx-auto bg-surface rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">Submit Task</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1">
              Task ID
            </label>
            <input
              type="text"
              name="taskId"
              value={formData.taskId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-main mb-1">
              Attachments (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-secondary hover:bg-secondary-hover text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-focus disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionPage;