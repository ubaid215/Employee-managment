import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Briefcase, 
  Calendar, DollarSign, Clock,
  PieChart, Settings, LogOut,
  Laptop2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/all-employees', icon: Users, label: 'Employees' },
    { path: '/admin/departments', icon: Briefcase, label: 'Departments' },
    { path: '/admin/duties-manage', icon: Laptop2, label: 'Create Duties' },
    { path: '/admin/leaves-manage', icon: Calendar, label: 'Leave Requests' },
    { path: '/admin/add-salary', icon: DollarSign, label: 'Salaries' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0 ">
      <div className="flex flex-col w-64 h-screen border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-blue-50 backdrop-blur-sm">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-slate-200/60 bg-white/50">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-md">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col flex-grow px-4 py-2 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center cursor-pointer px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-md text-blue-600 border border-slate-200/60'
                      : 'text-slate-600 hover:bg-white/80 hover:shadow-sm hover:border hover:border-slate-200/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 mr-3 rounded-lg ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* Logout */}
          <div className="mt-auto mb-2 pt-4 border-t border-slate-200/40">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200 hover:border hover:border-slate-200/40"
            >
              <div className="p-1.5 mr-3 rounded-lg bg-slate-100 text-slate-600">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;