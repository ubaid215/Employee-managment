import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Settings,
  Home,
  Briefcase,
  Laptop2,
  DollarSign,
  MoreHorizontal,
  X
} from 'lucide-react';

const AdminBottomNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const primaryNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/all-employees', icon: Users, label: 'Employees' },
    { path: '/admin/leaves-manage', icon: Calendar, label: 'Leaves' }
  ];

  const moreNavItems = [
    { path: '/admin/departments', icon: Briefcase, label: 'Departments' },
    { path: '/admin/duties-manage', icon: Laptop2, label: 'Duties' },
    { path: '/admin/add-salary', icon: DollarSign, label: 'Salaries' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const allItems = [...primaryNavItems, ...moreNavItems];
  const isMoreItemActive = moreNavItems.some(item => activePath === item.path);

  const toggleMore = () => {
    setShowMore(!showMore);
  };

  // Close more menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMore) setShowMore(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMore]);

  return (
    <>
      {/* Overlay with better glass effect */}
      {showMore && (
        <div 
          className="md:hidden fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={toggleMore}
        />
      )}
      
      {/* More Menu with improved styling */}
      {showMore && (
        <div className="md:hidden fixed bottom-16 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200/60 z-50 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 p-3">
            {moreNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setShowMore(false)}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center py-3 px-2 text-xs rounded-lg transition-colors
                  ${isActive
                    ? 'text-blue-600 bg-blue-50/50 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  activePath === item.path 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Main Bottom Navigation with enhanced styling */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/60 shadow-lg z-50">
        <div className="flex justify-around items-stretch">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs
                transition-all duration-200
                ${isActive
                  ? 'text-blue-600 bg-blue-50/50 border-t-2 border-blue-500' 
                  : 'text-gray-600 hover:text-blue-500'
                }
              `}
            >
              <div className={`p-1.5 rounded-full mb-1 ${
                activePath === item.path 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          {/* More Button with improved active state */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMore();
            }}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs transition-all
              ${showMore || isMoreItemActive
                ? 'text-blue-600 bg-blue-50/50 border-t-2 border-blue-500'
                : 'text-gray-600 hover:text-blue-500'
              }
            `}
          >
            <div className={`p-1.5 rounded-full mb-1 ${
              showMore || isMoreItemActive
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500'
            }`}>
              {showMore ? (
                <X className="w-5 h-5" />
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
            </div>
            <span className="font-medium">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminBottomNav;