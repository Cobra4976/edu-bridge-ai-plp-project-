import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error boundary wrapper
class ErrorBoundary extends StrictMode {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Render the app first
try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Failed to load app</h1>
      <p>${error.message}</p>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
}

// ✅ Service Worker Registration with Mobile-Friendly Updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Service Worker registered');
        }

        // ✅ Check for updates every 30 minutes (less aggressive)
        setInterval(() => {
          registration.update().catch(() => {
            // Silently fail on mobile if offline
          });
        }, 30 * 60 * 1000);

        // ✅ Listen for updates (mobile-friendly)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // ✅ New version available - don't auto-reload on mobile
                // Just log it, let user manually reload
                if (process.env.NODE_ENV === 'development') {
                  console.log('🆕 New version available');
                }

                // Show a subtle notification instead of auto-reload
                const updateBanner = document.createElement('div');
                updateBanner.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  background: #2e7d32;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  z-index: 9999;
                  font-size: 14px;
                `;
                updateBanner.innerHTML = `
                  New version available! 
                  <button onclick="window.location.reload()" style="margin-left: 10px; padding: 5px 10px; background: white; color: #2e7d32; border: none; border-radius: 4px; cursor: pointer;">
                    Reload
                  </button>
                  <button onclick="this.parentElement.remove()" style="margin-left: 10px; padding: 5px 10px; background: transparent; color: white; border: 1px solid white; border-radius: 4px; cursor: pointer;">
                    Later
                  </button>
                `;
                document.body.appendChild(updateBanner);
              }
            });
          }
        });

        // ✅ Force check for updates on page focus (mobile-friendly)
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && navigator.onLine) {
            registration.update().catch(() => {
              // Silently fail if offline
            });
          }
        });
      })
      .catch((error) => {
        // Don't crash on mobile if SW fails
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Service Worker registration failed:', error);
        }
      });
  });

  // ✅ Utility function to manually clear cache (for debugging)
  window.clearServiceWorkerCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.unregister();
        }
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };
}
