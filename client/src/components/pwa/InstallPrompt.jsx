import { useEffect, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white shadow-lg rounded-lg border border-stone-200 p-4 max-w-md mx-auto">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <ArrowDownTrayIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-slate-800">
            Install App
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Add this app to your home screen for faster access and offline use.
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleInstall}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center px-3 py-2 border border-stone-300 text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Not Now
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