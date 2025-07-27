import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Lock, Mail, Eye, EyeOff, 
  CheckCircle, XCircle, Loader2 
} from 'lucide-react';

const Settings = () => {
  const { 
    loading,
    error,
    clearError
  } = useAdmin();

  // Form states
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle form input changes
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  // Handle form submissions
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with actual API call from your authService
      // await authService.updateEmail(emailForm.newEmail, emailForm.currentPassword);
      setSuccessMessage('Email updated successfully!');
      setEmailForm({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Email update failed:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace with actual API call from your authService
      // await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccessMessage('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Password update failed:', err);
    }
  };

  // Validate forms
  const isEmailValid = () => {
    return (
      emailForm.newEmail &&
      emailForm.newEmail === emailForm.confirmEmail &&
      emailForm.currentPassword
    );
  };

  const isPasswordValid = () => {
    return (
      passwordForm.newPassword &&
      passwordForm.newPassword === passwordForm.confirmPassword &&
      passwordForm.currentPassword &&
      passwordForm.newPassword.length >= 8
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h1>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'email' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('email')}
          >
            Change Email
          </button>
        </div>

        {/* Password Change Form */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock size={20} className="text-blue-500" />
              Update Password
            </h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword && 
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords don't match
                    </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email Change Form */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail size={20} className="text-blue-500" />
              Update Email Address
            </h2>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={emailForm.currentPassword}
                    onChange={handleEmailChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Email Address
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailForm.newEmail}
                  onChange={handleEmailChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Confirm Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Email
                </label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {emailForm.newEmail && emailForm.confirmEmail && 
                  emailForm.newEmail !== emailForm.confirmEmail && (
                    <p className="text-xs text-red-500 mt-1">
                      Email addresses don't match
                    </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isEmailValid()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">Security Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Use a strong, unique password</li>
            <li>Never share your credentials with anyone</li>
            <li>Update your password regularly</li>
            <li>Ensure your email is always up-to-date for security notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;