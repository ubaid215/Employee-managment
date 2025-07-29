import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Enhanced service worker registration with update handling
if ('serviceWorker' in navigator) {
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Update available - handled by UpdatePrompt component
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update().catch(err => {
          console.debug('Service worker update check failed:', err);
        });
      }, 60 * 60 * 1000); // Check every hour

      console.log('ServiceWorker registration successful');
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  };

  window.addEventListener('load', registerServiceWorker);
  window.addEventListener('focus', registerServiceWorker); // Also check when user returns to app
}

// Web App Install Prompt tracking
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  if (window.gtag) {
    window.gtag('event', 'pwa_installed');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);