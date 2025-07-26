import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/commonSidebar';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';

const EmployeeLayout = () => {
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