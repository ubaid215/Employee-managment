import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, Bell, Search, 
  Briefcase, Calendar, DollarSign, User,
  Wifi, WifiOff
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import NetworkStatus from '../pwa/NetworkStatus'; 

const Navbar = ({ toggleSidebar }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const titles = {
      '': 'Dashboard',
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
    <header className={`sticky top-0 z-20 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-sm shadow-sm' 
        : 'bg-white/80 backdrop-blur-sm'
    } border-b border-gray-200/60`}>
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="hidden sm:inline-block mr-2 text-blue-500">
                {location.pathname.includes('duties') && <Briefcase size={18} />}
                {location.pathname.includes('leave') && <Calendar size={18} />}
                {location.pathname.includes('salary') && <DollarSign size={18} />}
                {location.pathname.includes('profile') && <User size={18} />}
              </span>
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Network Indicator (Simplified) */}
          <div className="md:hidden">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          {/* Desktop Network Status */}
          <div className="hidden md:block">
            <NetworkStatus />
          </div>
          
          {/* Search button */}
          <button className="hidden md:flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Time and date (desktop only) */}
          <div className="hidden md:flex flex-col items-end pl-3 border-l border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
          
          {/* User avatar */}
          <div className="flex items-center ml-2">
            <UserAvatar className="w-8 h-8" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;