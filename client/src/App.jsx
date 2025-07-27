import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { AdminProvider } from './context/AdminContext';
import Router from './router/Router';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <EmployeeProvider>
          <AdminProvider>
            <div className="App">
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }
                }}
              />
              <Router />
            </div>
          </AdminProvider>
        </EmployeeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
