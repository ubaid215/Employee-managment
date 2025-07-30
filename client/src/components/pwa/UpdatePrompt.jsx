import { useEffect, useState } from 'react';
import { Download, X, Sparkles, RefreshCw } from 'lucide-react';

export const UpdatePrompt = ({ updateFeatures = [] }) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

 useEffect(() => {
  if ('serviceWorker' in navigator) {
    const controllerChangeHandler = () => {
      setIsUpdateAvailable(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    let reg;
    let updateFoundHandler;

    navigator.serviceWorker.ready.then((registration) => {
      reg = registration;
      setRegistration(registration);

      updateFoundHandler = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
          }
        });
      };

      registration.addEventListener('updatefound', updateFoundHandler);
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      if (reg && updateFoundHandler) {
        reg.removeEventListener('updatefound', updateFoundHandler);
      }
    };
  }
}, []);


  const handleUpdate = async () => {
    if (registration && registration.waiting) {
      setIsUpdating(true);
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleDismiss = () => {
    setIsUpdateAvailable(false);
  };

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-white/5 rounded-full" />
          
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Update Available</h3>
                <p className="text-blue-100 text-sm">New version ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            A new version of the app is available with improvements and bug fixes.
          </p>

          {/* Features list */}
          {updateFeatures.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                What's New
              </h4>
              {updateFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Update Now</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};