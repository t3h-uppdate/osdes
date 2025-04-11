import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainSite from './pages/MainSite'; // Import the main site component
import AdminDashboard from './features/admin/views/AdminDashboard'; // Import the admin dashboard component
import LoginPage from './features/admin/views/LoginPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import DynamicPage from './pages/DynamicPage'; // Import the DynamicPage component
import NotFoundPage from './pages/NotFoundPage'; // Import a 404 page (assuming it exists or will be created)
import { NotificationProvider } from './contexts/NotificationContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';

function App() {
  return (
    <NotificationProvider>
      <SiteSettingsProvider> {/* Wrap with SiteSettingsProvider */}
        <Router>
          <Routes>
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
        </Router>
        {/* ToastNotification might be rendered here or within NotificationProvider */}
      </SiteSettingsProvider>
    </NotificationProvider>
  );
}

export default App;
