import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';

const ProfilePage = () => {
  const { user, updateProfile, updateProfileImage, deleteProfileImage, updatePassword, updateEmail, loading, error } = useUser();
  const [profileForm, setProfileForm] = useState({ name: '', department: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', password: '', passwordConfirm: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [file, setFile] = useState(null);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        department: user.department?.name || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        await updateProfileImage(file);
        setFile(null);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      await deleteProfileImage();
    } catch (err) {
      console.error('Image deletion failed:', err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Fixed: Pass the entire form object
      await updatePassword(passwordForm);
      setPasswordForm({ currentPassword: '', password: '', passwordConfirm: '' });
    } catch (err) {
      console.error('Password update failed:', err);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Fixed: Pass the entire form object
      await updateEmail(emailForm);
      setEmailForm({ newEmail: '', password: '' });
    } catch (err) {
      console.error('Email update failed:', err);
    }
  };

  // ✅ Fixed: Better loading state handling
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-error">Unable to load user profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <div className="space-y-6">
          {/* Personal Info Card */}
          <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-text-main">Personal Information</h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full p-2 border rounded-md focus-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2">Department</label>
                  <p className="text-text-main">{profileForm.department}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2 disabled:opacity-60"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* Profile Image Card */}
          <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-text-main">Profile Image</h2>
            </div>
            <div className="p-4">
              {user.profileImage ? (
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                  />
                  <button
                    onClick={handleDeleteImage}
                    className="text-error hover:underline text-sm mt-2"
                  >
                    Delete Image
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-bg-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-muted">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
              )}
              
              <form onSubmit={handleImageSubmit} className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-2 border rounded-md focus-ring"
                />
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="btn-primary w-full py-2 disabled:opacity-60"
                >
                  {loading ? 'Uploading...' : 'Upload Image'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6">
          {/* Password Update Card */}
          <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-text-main">Update Password</h2>
            </div>
            <div className="p-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-md focus-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="password">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-md focus-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="passwordConfirm">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={passwordForm.passwordConfirm}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-md focus-ring"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2 disabled:opacity-60"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Email Update Card */}
          <div className="bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-text-main">Update Email</h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="newEmail">
                    New Email
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={handleEmailChange}
                    className="w-full p-2 border rounded-md focus-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2" htmlFor="emailPassword">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="emailPassword"
                    name="password"
                    value={emailForm.password}
                    onChange={handleEmailChange}
                    className="w-full p-2 border rounded-md focus-ring"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2 disabled:opacity-60"
                >
                  {loading ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-error/10 p-4 rounded-lg border border-error/20">
          <p className="text-error text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;