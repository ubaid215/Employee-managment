import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Upload, Download } from 'lucide-react';

export const SyncIndicator = () => {
  const [syncState, setSyncState] = useState({
    status: 'idle', // 'idle', 'syncing', 'success', 'error'
    lastSynced: null,
    pendingItems: 0,
    syncType: 'upload' // 'upload', 'download', 'both'
  });

  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register background sync
        registration.sync.register('sync-queue').then(() => {
          setSyncState(prev => ({ ...prev, status: 'syncing', syncType: 'upload' }));
        });
      });

      // Listen for sync events
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
          
          // Reset to idle after 3 seconds
          setTimeout(() => {
            setSyncState(prev => ({ ...prev, status: 'idle' }));
          }, 3000);
        } else if (event.data.type === 'SYNC_ERROR') {
          setSyncState(prev => ({ ...prev, status: 'error' }));
          
          // Reset to idle after 5 seconds
          setTimeout(() => {
            setSyncState(prev => ({ ...prev, status: 'idle' }));
          }, 5000);
        }
      });
    }
  }, []);

  const getSyncIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return syncState.syncType === 'download' ? Download : Upload;
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertTriangle;
      default:
        return null;
    }
  };

  const getSyncColor = () => {
    switch (syncState.status) {
      case 'syncing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSyncBackground = () => {
    switch (syncState.status) {
      case 'syncing':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (syncState.status === 'idle') return null;

  const Icon = getSyncIcon();
  const color = getSyncColor();
  const bgClass = getSyncBackground();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className={`flex items-center px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${bgClass}`}>
        <div className="flex items-center space-x-3">
          {Icon && (
            <Icon 
              className={`h-5 w-5 ${color} ${
                syncState.status === 'syncing' ? 'animate-spin' : ''
              }`} 
            />
          )}
          
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${color}`}>
              {syncState.status === 'syncing' && 'Syncing data...'}
              {syncState.status === 'success' && 'Sync complete'}
              {syncState.status === 'error' && 'Sync failed'}
            </span>
            
            {syncState.status === 'syncing' && syncState.pendingItems > 0 && (
              <span className="text-xs text-gray-500">
                {syncState.pendingItems} items pending
              </span>
            )}
            
            {syncState.status === 'success' && syncState.lastSynced && (
              <span className="text-xs text-gray-500">
                {syncState.lastSynced.toLocaleTimeString()}
              </span>
            )}
            
            {syncState.status === 'error' && (
              <span className="text-xs text-gray-500">
                Tap to retry
              </span>
            )}
          </div>
        </div>
        
        {/* Progress indicator for syncing */}
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