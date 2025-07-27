import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';

export const PushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isSubscribed) {
        const subscription = await registration.pushManager.getSubscription();
        await subscription.unsubscribe();
        setIsSubscribed(false);
      } else {
        // Check permission first
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
          });
          setIsSubscribed(true);
          // Send subscription to your server
        }
      }
    } catch (error) {
      console.error('Error managing push subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptResponse = (accept) => {
    setShowPrompt(false);
    if (accept) {
      toggleNotifications();
    }
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Notification Toggle Button */}
      <div className="relative">
        <button
          onClick={() => isSubscribed ? toggleNotifications() : setShowPrompt(true)}
          disabled={isLoading}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isSubscribed 
              ? 'bg-green-100 hover:bg-green-200 text-green-600' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          aria-label={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isSubscribed ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          
          {/* Status indicator */}
          {isSubscribed && !isLoading && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </button>
      </div>

      {/* Permission Prompt */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-600 text-sm">
                Get notified about important updates, new features, and personalized content
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Important updates</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">New feature announcements</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Personalized content</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handlePromptResponse(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Allow Notifications
              </button>
              <button
                onClick={() => handlePromptResponse(false)}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};