import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import MainSite from './pages/MainSite'; // Import the main site component
import AdminDashboard from './features/admin/views/AdminDashboard'; // Import the admin dashboard component
import LoginPage from './features/admin/views/LoginPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import DynamicPage from './pages/DynamicPage'; // Import the DynamicPage component
import ProductDetailPage from './pages/ProductDetailPage'; // Import the Product Detail Page component
import NotFoundPage from './pages/NotFoundPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { SiteProvider } from './contexts/SiteSettingsContext'; // Import the renamed provider

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
         {/* Use category and slug for product details */}
         <Route path="/product/:category/:productSlug" element={<ProductDetailPage />} />
         <Route path="/:slug" element={<DynamicPage />} /> {/* Route for dynamic pages - Keep this AFTER specific routes */}
         <Route path="*" element={<NotFoundPage />} /> {/* Catch-all 404 route */}
       </Routes>
    </AnimatePresence>
  );
}


function App() {
  return (
    <NotificationProvider>
      {/* SiteProvider is already wrapping App in main.tsx, removed from here */}
      <Router>
        <AnimatedRoutes /> {/* Use the component that contains animated routes */}
      </Router>
      {/* ToastNotification might be rendered here or within NotificationProvider */}
    </NotificationProvider>
  );
}

export default App;
