import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
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