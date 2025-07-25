import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, CreditCard, AlertCircle, Loader2, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    cnic: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Password confirmation is required';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/[\s-+()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.cnic) {
      errors.cnic = 'CNIC is required';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      errors.cnic = 'CNIC format should be: 12345-1234567-1';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateForm()) {
      setLocalError('Please fix the errors below');
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/account-pending', { 
          state: { 
            message: 'Registration successful! Your account is pending admin approval.',
            email: formData.email 
          }
        });
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const formatCNIC = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
  };

  const handleCNICChange = (e) => {
    const formatted = formatCNIC(e.target.value);
    setFormData(prev => ({
      ...prev,
      cnic: formatted
    }));
    
    if (validationErrors.cnic) {
      setValidationErrors(prev => ({
        ...prev,
        cnic: ''
      }));
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-text-main mb-2">Create Account</h1>
          <p className="text-muted">Join as an employee</p>
        </div>

        {/* Registration Form */}
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Error Display */}
          {displayError && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <div>
                <p className="text-error text-sm">{displayError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm text-muted mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus-ring ${
                    validationErrors.name ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-error">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm text-muted mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus-ring ${
                    validationErrors.email ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-error">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm text-muted mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus-ring ${
                    validationErrors.phone ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-error">{validationErrors.phone}</p>
              )}
            </div>

            {/* CNIC Field */}
            <div>
              <label htmlFor="cnic" className="block text-sm text-muted mb-2">
                CNIC Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-muted" />
                </div>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleCNICChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus-ring ${
                    validationErrors.cnic ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="12345-1234567-1"
                  maxLength="15"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.cnic && (
                <p className="mt-1 text-sm text-error">{validationErrors.cnic}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm text-muted mb-2">
                Password
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
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus-ring ${
                    validationErrors.password ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted hover:text-text-main" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted hover:text-text-main" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-error">{validationErrors.password}</p>
              )}
            </div>

            {/* Password Confirmation Field */}
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
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md focus-ring ${
                    validationErrors.passwordConfirm ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={isLoading}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-5 w-5 text-muted hover:text-text-main" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted hover:text-text-main" />
                  )}
                </button>
              </div>
              {validationErrors.passwordConfirm && (
                <p className="mt-1 text-sm text-error">{validationErrors.passwordConfirm}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2 mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-muted text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms Links */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;