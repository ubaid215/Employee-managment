import { useEffect, useState } from 'react';
import { X, Download, Smartphone, Rocket, Zap } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setHasInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if not dismissed recently (check localStorage)
      const lastDismissed = localStorage.getItem('installPromptDismissed');
      if (!lastDismissed || Date.now() - lastDismissed > 7 * 24 * 60 * 60 * 1000) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setHasInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setHasInstalled(true));
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsVisible(false);
        // Track installation in analytics
        window.gtag?.('event', 'pwa_install_success');
      }
    } catch (error) {
      console.error('Install failed:', error);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDeferredPrompt(null);
    // Remember dismissal for 1 week
    localStorage.setItem('installPromptDismissed', Date.now());
  };

  if (!isVisible || hasInstalled) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[100] px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative bg-white/95 backdrop-blur-sm p-6 rounded-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <Rocket className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                Install App <Zap className="h-4 w-4 text-yellow-500" />
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add to your home screen for faster access and offline functionality
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};