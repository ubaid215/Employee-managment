import { useState, useEffect } from 'react';
import { ArrowUp, Share2, Smartphone } from 'lucide-react';

export const IOSInstallHint = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isStandalone) {
      const hasSeenHint = localStorage.getItem('iosHintDismissed');
      if (!hasSeenHint) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('iosHintDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-64">
        <div className="p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-3">
            <Share2 className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Add to Home Screen</p>
              <p className="text-xs text-gray-500 mt-1">
                Tap <ArrowUp className="inline h-3 w-3" /> then "Add to Home Screen"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};