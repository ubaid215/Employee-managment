import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Extract page title from pathname
    const path = location.pathname.split('/')[1];
    const titles = {
      'dashboard': 'Dashboard',
      'profile': 'My Profile',
      'duties': 'My Duties',
      'leave': 'Leave Management',
      'salary': 'Salary Records',
      'attendance': 'Attendance',
      'settings': 'Settings'
    };
    setPageTitle(titles[path] || 'Employee Portal');
  }, [location]);

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 text-gray-500 md:hidden hover:text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-sm text-gray-600">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;