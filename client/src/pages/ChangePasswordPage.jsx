import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { updatePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light p-4">
      <div className="max-w-md mx-auto bg-surface rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">Change Password</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-accent/10 text-accent rounded-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-main mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-focus"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-focus disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;