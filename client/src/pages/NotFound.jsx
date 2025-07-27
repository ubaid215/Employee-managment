import { useState, useEffect } from 'react';
import { Home, ArrowLeft, Mail, Wifi, WifiOff } from 'lucide-react';

const NotFound = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleGoHome = () => {
    // Navigate to home - replace with your navigation logic
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Network status indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isOnline 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          {/* 404 Hero Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              {/* Glitch effect background */}
              <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[12rem] font-black text-purple-500/20 blur-sm transform translate-x-1 translate-y-1">
                404
              </div>
              <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[12rem] font-black text-pink-500/20 blur-sm transform -translate-x-1 -translate-y-1">
                404
              </div>
              {/* Main 404 text */}
              <h1 className="relative text-8xl sm:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                404
              </h1>
            </div>
            
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Oops! Page Not Found
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                The page you're looking for seems to have vanished into the digital void. 
                Don't worry, even the best explorers sometimes take a wrong turn.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGoHome}
              className="group relative w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3"
            >
              <Home size={20} />
              <span>Take Me Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </button>
            
            <button
              onClick={handleGoBack}
              className="group relative w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/20 flex items-center justify-center gap-3"
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Features grid for PWA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Offline support */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <WifiOff className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold mb-2">Works Offline</h3>
              <p className="text-gray-400 text-sm">
                This app works even when you're offline
              </p>
            </div>

            {/* Fast loading */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">
                Optimized for speed and performance
              </p>
            </div>

            {/* Mobile first */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-6 bg-white rounded-sm relative">
                  <div className="absolute top-0.5 left-0.5 right-0.5 h-1 bg-gray-800 rounded-full" />
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-gray-800 rounded-full" />
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">Mobile Ready</h3>
              <p className="text-gray-400 text-sm">
                Perfect experience on any device
              </p>
            </div>
          </div>

          {/* Support section */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
              <Mail className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-gray-400 mb-4">
                Our support team is here to help you get back on track
              </p>
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
              >
                <Mail size={16} />
                support@example.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PWA install prompt (if applicable) */}
      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">Install App</p>
              <p className="text-white/80 text-xs">Add to home screen for quick access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;