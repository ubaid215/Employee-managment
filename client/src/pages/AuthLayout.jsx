import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import AdminSidebar from '../components/common/AdminSidebar';
import Navbar from '../components/common/Navbar';

const AdminLayout = () => {
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
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;