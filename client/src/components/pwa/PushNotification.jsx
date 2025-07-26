import { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

export const PushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const toggleNotifications = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isSubscribed) {
        const subscription = await registration.pushManager.getSubscription();
        await subscription.unsubscribe();
        setIsSubscribed(false);
      } else {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
        });
        setIsSubscribed(true);
        // Send subscription to your server
      }
    } catch (error) {
      console.error('Error managing push subscription:', error);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleNotifications}
      className="p-2 rounded-full hover:bg-stone-100"
      aria-label={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      {isSubscribed ? (
        <BellIcon className="h-5 w-5 text-amber-600" />
      ) : (
        <BellSlashIcon className="h-5 w-5 text-slate-400" />
      )}
    </button>
  );
};