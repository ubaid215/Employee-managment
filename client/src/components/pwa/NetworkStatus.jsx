import { useEffect, useState } from 'react';
import {
  WifiIcon,
  SignalSlashIcon,
  SignalIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

export const NetworkStatus = () => {
  const [connection, setConnection] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const updateConnectionStatus = () => {
        setConnection({
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        });
      };

      navigator.connection.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus();

      return () => {
        navigator.connection.removeEventListener('change', updateConnectionStatus);
      };
    }
  }, []);

  const getConnectionIcon = () => {
    if (!navigator.onLine) return SignalSlashIcon;
    if (connection.effectiveType.includes('4g')) return WifiIcon;
    if (connection.effectiveType.includes('3g')) return SignalIcon;
    return Bars3Icon;
  };

  const Icon = getConnectionIcon();
  const color = connection.effectiveType.includes('4g') 
    ? 'text-emerald-600' 
    : connection.effectiveType.includes('3g') 
      ? 'text-amber-600' 
      : 'text-rose-600';

  return (
    <div className="flex items-center text-sm">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="ml-1 text-slate-600 hidden sm:inline">
        {connection.effectiveType.toUpperCase()}
      </span>
    </div>
  );
};