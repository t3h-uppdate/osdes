import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { SiteProvider } from './contexts/SiteSettingsContext.tsx'; // Import the renamed provider
import './index.css'; // Main CSS file with Tailwind and custom styles

createRoot(document.getElementById('root')!).render(
  // <StrictMode> {/* Temporarily commented out for react-beautiful-dnd debugging */}
    <HelmetProvider>
      <SiteProvider> {/* Use the renamed provider */}
        <App />
      </SiteProvider>
    </HelmetProvider>
  // </StrictMode>
);
