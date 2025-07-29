import { useState, useEffect } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';

export const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 animate-fade-in">
        <WifiOff className="h-5 w-5 text-yellow-600" />
        <span className="text-sm font-medium text-gray-800">Working offline</span>
      </div>
    </div>
  );
};