import { useEffect, useState } from 'react';
import { WifiIcon, WifiSlashIcon } from '@heroicons/react/24/outline';

export const OfflineIndicator = () => {
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
    <div className="fixed bottom-4 left-4 z-50 bg-rose-100 text-rose-800 rounded-full px-3 py-2 flex items-center shadow-md">
      <WifiSlashIcon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">Offline Mode</span>
    </div>
  );
};