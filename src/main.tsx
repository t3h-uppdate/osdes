import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.tsx'; // Import the provider
import './index.css'; // Main CSS file with Tailwind and custom styles

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <SiteSettingsProvider> {/* Wrap App with the SiteSettingsProvider */}
        <App />
      </SiteSettingsProvider>
    </HelmetProvider>
  </StrictMode>
);
