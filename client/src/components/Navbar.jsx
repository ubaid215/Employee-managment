import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(isAuthenticated
      ? [
          { to: '/profile', label: 'Profile' },
          { to: '/duties', label: 'Duties' },
          { to: '/leaves', label: 'Leaves' },
          { to: '/salary', label: 'Salary' },
          ...(user?.role === 'admin'
            ? [
                { to: '/admin/employees', label: 'Employees' },
                { to: '/admin/departments', label: 'Departments' },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <nav className="bg-primary text-white p-4 font-primary sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold hover:text-gray-200 transition-colors">
          EMA
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-primary-hover"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn-error px-4 py-2 ml-4"
            >
              Logout
            </button>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl p-2 rounded-full hover:bg-primary-hover transition-colors focus-ring"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary p-4 space-y-3 border-t border-primary-hover">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block hover:text-gray-200 transition-colors p-3 rounded-lg hover:bg-primary-hover"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="btn-error w-full text-left p-3 rounded-lg mt-2"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;