import { useEffect, useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const SyncIndicator = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-queue').then(() => {
          setIsSyncing(true);
        });
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETED') {
          setIsSyncing(false);
          setLastSynced(new Date());
        }
      });
    }
  }, []);

  if (!isSyncing && !lastSynced) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-full shadow-md px-3 py-2 flex items-center border border-stone-200">
      {isSyncing ? (
        <>
          <ArrowPathIcon className="h-4 w-4 mr-2 text-amber-600 animate-spin" />
          <span className="text-sm text-slate-700">Syncing data...</span>
        </>
      ) : (
        <>
          <CheckCircleIcon className="h-4 w-4 mr-2 text-emerald-600" />
          <span className="text-sm text-slate-700">
            Synced {lastSynced.toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  );
};