import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      setSuccess(response.message);
      setEmail('');
    } catch (err) {
      console.error('Forgot password failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
        <h2 className="text-xl font-semibold text-text-main mb-4 text-center">Forgot Password</h2>
        {success ? (
          <div className="text-center">
            <p className="text-accent mb-4">{success}</p>
            <Link
              to="/login"
              className="btn-primary w-full"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md focus-ring"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {error && <p className="text-error text-center text-sm">{error}</p>}
          </form>
        )}
        <p className="text-muted text-sm text-center mt-4">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;