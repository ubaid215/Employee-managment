import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalMedium, SignalLow } from 'lucide-react';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getConnectionDetails = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Offline',
        speed: null
      };
    }

    const speed = connection.downlink;
    if (speed >= 10) {
      return {
        icon: SignalHigh,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: connection.effectiveType?.toUpperCase() || '4G',
        speed: `${speed.toFixed(1)} Mbps`
      };
    } else if (speed >= 1.5) {
      return {
        icon: SignalMedium,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: connection.effectiveType?.toUpperCase() || '3G',
        speed: `${speed.toFixed(1)} Mbps`
      };
    } else {
      return {
        icon: SignalLow,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: connection.effectiveType?.toUpperCase() || '2G',
        speed: `${speed.toFixed(1)} Mbps`
      };
    }
  };

  const { icon: Icon, color, bgColor, borderColor, label, speed } = getConnectionDetails();

  return (
    <div 
      className={`inline-flex items-center px-3 py-1.5 rounded-full border ${bgColor} ${borderColor} transition-all duration-200 hover:shadow-sm cursor-default`}
      title={`Network status: ${label}${speed ? ` (${speed})` : ''}`}
    >
      <Icon className={`h-4 w-4 ${color} mr-2`} />
      <div className="flex flex-col sm:flex-row sm:items-center">
        <span className={`text-xs font-medium ${color}`}>
          {label}
        </span>
        {speed && (
          <span className="text-xs text-gray-500 sm:ml-2">
            {speed}
          </span>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;