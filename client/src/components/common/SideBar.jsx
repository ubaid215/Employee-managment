import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, User, Briefcase, 
  Calendar, DollarSign, Clock,
  LogOut, ChevronRight, 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/duties', icon: Briefcase, label: 'Duties' },
    { path: '/leave', icon: Calendar, label: 'Leave' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 h-screen border-r border-slate-200/60 bg-gradient-to-b from-white to-slate-50">
        {/* Logo/Branding */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              WorkPortal
            </h1>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col flex-grow px-4 py-6 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-100' 
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                  }
                `}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-3 ${location.pathname === item.path ? 'text-blue-500' : 'text-slate-500'}`} />
                  {item.label}
                </div>
                {location.pathname === item.path && (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* User & Logout */}
          <div className="mt-auto space-y-4">
            <div className="px-4 py-3 bg-slate-100/50 rounded-xl">
              <div className="text-xs font-medium text-slate-500 mb-1">Logged in as</div>
              <div className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email || 'email@example.com'}
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100/50 hover:text-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-slate-500" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;