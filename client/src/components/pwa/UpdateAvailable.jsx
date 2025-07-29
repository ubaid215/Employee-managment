import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const UpdateAvailable = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      const checkUpdate = async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          setUpdateAvailable(true);
          setRegistration(reg);
        }
      };

      navigator.serviceWorker.register('/sw.js').then(checkUpdate);
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <RefreshCw className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Update Available</p>
          <p className="text-xs text-gray-500">Refresh to get the latest version</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};