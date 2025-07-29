import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated spinner with gradient */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full absolute border-4 border-slate-200"></div>
          <div className="w-16 h-16 rounded-full animate-spin border-4 border-blue-500 border-t-transparent"></div>
        </div>
        
        {/* Loading text with fade animation */}
        <div className="text-center space-y-2">
          <p className="text-xl font-medium text-slate-700 animate-pulse">Loading Dashboard</p>
          <p className="text-sm text-slate-500">Please wait while we prepare your workspace</p>
        </div>
        
        {/* Optional progress bar */}
        <div className="w-48 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="fixed top-1/4 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-1/4 right-1/4 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default LoadingScreen;