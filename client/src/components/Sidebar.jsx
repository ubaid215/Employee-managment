import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { FaBars, FaTimes, FaHome, FaUser, FaTasks, FaCalendar, FaMoneyBill, FaUsers, FaBuilding } from 'react-icons/fa';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home', icon: <FaHome /> },
    ...(isAuthenticated
      ? [
          { to: '/profile', label: 'Profile', icon: <FaUser /> },
          { to: '/duties', label: 'Duties', icon: <FaTasks /> },
          { to: '/leaves', label: 'Leaves', icon: <FaCalendar /> },
          { to: '/salary', label: 'Salary', icon: <FaMoneyBill /> },
          ...(user?.role === 'admin'
            ? [
                { to: '/admin/employees', label: 'Employees', icon: <FaUsers /> },
                { to: '/admin/departments', label: 'Departments', icon: <FaBuilding /> },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <>
      <aside
        className={`bg-surface w-64 p-4 font-primary fixed top-0 left-0 h-full border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-main">Menu</h2>
          <button
            className="md:hidden text-text-main hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary text-white'
                  : 'text-text-main hover:bg-bg-light'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden fixed top-4 left-4 text-2xl text-text-main bg-surface p-2 rounded-full shadow-md z-30 focus-ring"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <FaBars />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;