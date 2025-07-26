import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, User, Briefcase, 
  Calendar, DollarSign
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/duties', icon: Briefcase, label: 'Duties' },
    { path: '/leave', icon: Calendar, label: 'Leave' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 px-4 text-xs ${
              location.pathname === item.path
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;