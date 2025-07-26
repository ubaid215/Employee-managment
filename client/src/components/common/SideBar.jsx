import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, User, Briefcase, 
  Calendar, DollarSign, Clock,
  LogOut, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/duties', icon: Briefcase, label: 'Duties' },
    { path: '/leave', icon: Calendar, label: 'Leave' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen border-r border-gray-200 bg-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Employee Portal</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto mb-4">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;