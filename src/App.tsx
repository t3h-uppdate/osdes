import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import MainSite from './pages/MainSite'; // Import the main site component
import AdminDashboard from './features/admin/views/AdminDashboard'; // Import the admin dashboard component
import LoginPage from './features/admin/views/LoginPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import DynamicPage from './pages/DynamicPage'; // Import the DynamicPage component
import NotFoundPage from './pages/NotFoundPage'; // Import a 404 page (assuming it exists or will be created)
import { NotificationProvider } from './contexts/NotificationContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

// We need a component to get location because useLocation can only be used inside a Router
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait"> {/* Wrap Routes with AnimatePresence */}
      <Routes location={location} key={location.pathname}> {/* Pass location and key */}
        <Route path="/" element={<MainSite />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/*" // Use /* to allow nested routes within AdminDashboard if needed
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/:slug" element={<DynamicPage />} /> {/* Route for dynamic pages */}
        <Route path="*" element={<NotFoundPage />} /> {/* Catch-all 404 route */}
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  return (
    <NotificationProvider>
      <SiteSettingsProvider> {/* Wrap with SiteSettingsProvider */}
        <Router>
          <AnimatedRoutes /> {/* Use the component that contains animated routes */}
        </Router>
        {/* ToastNotification might be rendered here or within NotificationProvider */}
      </SiteSettingsProvider>
    </NotificationProvider>
  );
}

export default App;
