import { useEffect, useState } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAnimation(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowAnimation(true);
      // Remove animation after it completes
      setTimeout(() => setShowAnimation(false), 500);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
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
          
          {/* Decorative elements */}
          <div className="hidden sm:block ml-auto">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};