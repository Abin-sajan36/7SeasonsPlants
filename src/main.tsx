import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Global resilience handler to prevent opaque/empty cross-origin "Uncaught " errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (!event.error || !event.message || event.message === 'Script error.') {
      event.preventDefault();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (!event.reason) {
      event.preventDefault();
      return false;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);

