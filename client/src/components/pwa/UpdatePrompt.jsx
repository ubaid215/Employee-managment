import { useEffect, useState } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const UpdatePrompt = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdateAvailable(true);
      });

      let registration;
      navigator.serviceWorker.ready.then((reg) => {
        registration = reg;
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
            }
          });
        });
      });

      return () => {
        if (registration) {
          registration.removeEventListener('updatefound');
        }
      };
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setIsUpdateAvailable(false);
  };

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg rounded-lg border border-stone-200 p-4 max-w-md mx-auto">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <ArrowPathIcon className="h-5 w-5 text-amber-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-slate-800">
            Update Available
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            A new version of the app is available. Refresh to update.
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleUpdate}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-2 border border-stone-300 text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 flex-shrink-0 flex"
        >
          <XMarkIcon className="h-5 w-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};