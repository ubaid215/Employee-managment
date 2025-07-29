import { useEffect, useState } from 'react';
import { WifiOff, AlertCircle, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAnimation(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOnlineToast) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 shadow-lg transform transition-transform duration-300 ${
          showAnimation ? 'animate-pulse' : ''
        }`}>
          <div className="flex items-center justify-center max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <WifiOff className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <span className="font-semibold text-sm">You're offline</span>
                <span className="text-sm opacity-90">Some features may be limited</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Online Toast */}
      {showOnlineToast && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 shadow-lg animate-fade-in">
          <div className="flex items-center justify-center max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Wifi className="h-5 w-5" />
              <span className="font-semibold text-sm">Connection restored</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};