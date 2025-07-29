import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { AdminProvider } from './context/AdminContext';
import Router from './router/Router';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { OfflineIndicator, UpdatePrompt, SyncIndicator, InstallPrompt } from './components/pwa';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <EmployeeProvider>
          <AdminProvider>
            <div className="App">
              {/* PWA Components */}
              <OfflineIndicator />
              <UpdatePrompt 
                updateFeatures={[
                  'Improved performance',
                  'New dashboard features',
                  'Bug fixes and security updates'
                ]}
              />
              <SyncIndicator />
              <InstallPrompt />
              
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
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
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