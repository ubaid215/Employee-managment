import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/SideBar';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';

const EmployeeLayout = () => {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, show only the outlet without navigation
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  // If user is authenticated, show full layout with navigation
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default EmployeeLayout;