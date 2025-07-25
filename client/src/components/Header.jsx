import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  
  // Get current page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/profile') return 'My Profile';
    if (path === '/duties') return 'My Duties';
    if (path === '/leaves') return 'Leave Management';
    if (path === '/salary') return 'Salary Records';
    if (path.startsWith('/admin')) return 'Admin Panel';
    return '';
  };

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-surface border-b border-gray-200 p-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-text-main">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted hidden md:block">
            {currentDate}
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <button className="text-muted hover:text-primary relative">
                <FaBell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle size={24} className="text-primary" />
                )}
                <span className="hidden md:inline text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;