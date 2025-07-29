import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Upload, Download } from 'lucide-react';

export const SyncIndicator = ({ onRetry }) => {
  const [syncState, setSyncState] = useState({
    status: 'idle',
    lastSynced: null,
    pendingItems: 0,
    syncType: 'upload'
  });

  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-queue').then(() => {
          setSyncState(prev => ({ ...prev, status: 'syncing', syncType: 'upload' }));
        });
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_STARTED') {
          setSyncState(prev => ({ 
            ...prev, 
            status: 'syncing', 
            pendingItems: event.data.pendingItems || 0,
            syncType: event.data.syncType || 'upload'
          }));
        } else if (event.data.type === 'SYNC_COMPLETED') {
          setSyncState(prev => ({
            ...prev,
            status: 'success',
            lastSynced: new Date(),
            pendingItems: 0
          }));
          
          setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' }), 3000));
        } else if (event.data.type === 'SYNC_ERROR') {
          setSyncState(prev => ({ ...prev, status: 'error' }));
          setTimeout(() => setSyncState(prev => ({ ...prev, status: 'idle' }), 5000));
        }
      });
    }
  }, []);

  const handleRetry = () => {
    if (onRetry) onRetry();
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
  };

  const getSyncDetails = () => {
    switch (syncState.status) {
      case 'syncing':
        return {
          icon: syncState.syncType === 'download' ? Download : Upload,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 border-blue-200',
          message: 'Syncing data...',
          subMessage: syncState.pendingItems > 0 ? `${syncState.pendingItems} items pending` : null
        };
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 border-green-200',
          message: 'Sync complete',
          subMessage: syncState.lastSynced?.toLocaleTimeString()
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 border-red-200',
          message: 'Sync failed',
          subMessage: 'Tap to retry'
        };
      default:
        return null;
    }
  };

  const details = getSyncDetails();
  if (!details || syncState.status === 'idle') return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 cursor-pointer ${syncState.status === 'error' ? 'animate-shake' : ''}`}
      onClick={syncState.status === 'error' ? handleRetry : undefined}
    >
      <div className={`flex items-center px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${details.bgColor} hover:shadow-xl`}>
        <div className="flex items-center space-x-3">
          <details.icon 
            className={`h-5 w-5 ${details.color} ${
              syncState.status === 'syncing' ? 'animate-spin' : ''
            }`} 
          />
          
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${details.color}`}>
              {details.message}
            </span>
            {details.subMessage && (
              <span className="text-xs text-gray-500">
                {details.subMessage}
              </span>
            )}
          </div>
        </div>
        
        {syncState.status === 'syncing' && (
          <div className="ml-3">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 border-2 border-blue-200 rounded-full" />
              <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};