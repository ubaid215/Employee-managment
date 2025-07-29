import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/common/AdminSidebar';
import AdminBottomNav from './AdminBottomNav';
import Navbar from '../../components/common/Navbar';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Admin Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar className="w-64 h-full border-r border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300" />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar with glass effect */}
        <Navbar className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm" />
        
        {/* Main content container */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 px-4 md:px-6 pt-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Admin Bottom Navigation - mobile only */}
        <div className="md:hidden">
          <AdminBottomNav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/60 shadow-lg z-50" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default AdminLayout;