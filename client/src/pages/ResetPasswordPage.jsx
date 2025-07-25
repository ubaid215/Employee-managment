import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const { resetPassword, loading, error } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    password: '', 
    passwordConfirm: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, formData.password, formData.passwordConfirm);
      navigate('/login', { state: { message: 'Password reset successfully!' } });
    } catch (err) {
      console.error('Reset password failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h2 className="text-2xl font-semibold text-text-main mb-2">Reset Password</h2>
          <p className="text-muted">Enter your new password below</p>
        </div>

        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-muted mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus-ring"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted hover:text-text-main" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted hover:text-text-main" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm text-muted mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus-ring"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-5 w-5 text-muted hover:text-text-main" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted hover:text-text-main" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;