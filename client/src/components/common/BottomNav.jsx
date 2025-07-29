import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, User, Briefcase, 
  Calendar, DollarSign
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/duties', icon: Briefcase, label: 'Duties' },
    { path: '/leave', icon: Calendar, label: 'Leave' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/60 shadow-lg z-50">
      <div className="flex justify-around items-stretch">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs
              transition-all duration-200
              ${isActive 
                ? 'text-blue-600 bg-blue-50/50 border-t-2 border-blue-500' 
                : 'text-slate-600 hover:text-blue-500'
              }
            `}
          >
            <div className={`p-2 rounded-full mb-1 transition-colors ${
              location.pathname === item.path 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-slate-500'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;