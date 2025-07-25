import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { FaHome, FaTasks, FaCalendar, FaMoneyBill, FaUser } from 'react-icons/fa';

const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();

  const navItems = [
    { to: '/', label: 'Home', icon: <FaHome /> },
    ...(isAuthenticated
      ? [
          { to: '/duties', label: 'Duties', icon: <FaTasks /> },
          { to: '/leaves', label: 'Leaves', icon: <FaCalendar /> },
          { to: '/salary', label: 'Salary', icon: <FaMoneyBill /> },
          { to: '/profile', label: 'Profile', icon: <FaUser /> },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-primary text-white p-3 font-primary flex justify-around items-center md:hidden z-50 safe-bottom">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex flex-col items-center text-xs hover:text-gray-200 transition-colors p-2 rounded-lg active:bg-primary-hover"
          aria-label={item.label}
        >
          <span className="text-xl mb-1">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;