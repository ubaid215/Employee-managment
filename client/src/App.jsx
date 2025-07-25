import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MobileBottomNav from "./components/MobileBottomNav";
import RealTimeUpdates from "./components/RealTimeUpdates";
import Router from "./router/Router";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { DutyProvider } from "./context/DutyContext";
import { LeaveProvider } from "./context/LeaveContext";
import { SalaryProvider } from "./context/SalaryContext";
import { SocketProvider } from "./context/SocketContext";

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <DutyProvider>
          <LeaveProvider>
            <SocketProvider>
              <SalaryProvider>
                <div className="flex flex-col min-h-screen bg-bg-light font-primary">
                  <Header /> {/* Replaced Navbar with Header */}
                  <div className="flex flex-1">
                    <Sidebar />
                    <main className="flex-1 p-4 md:ml-64">
                      <Router />
                    </main>
                  </div>
                  <MobileBottomNav />
                  <RealTimeUpdates />
                </div>
              </SalaryProvider>
            </SocketProvider>
          </LeaveProvider>
        </DutyProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;