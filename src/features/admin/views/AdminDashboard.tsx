// React & Router
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion

// Supabase
import supabase from '../../../config/supabaseConfig'; // Import Supabase client

// UI Libraries & Icons
import {
  LayoutDashboard, FileEdit, Link2, Settings, FileText, Briefcase, // Added Briefcase
  Image as ImageIcon
} from 'lucide-react';

// Context
// NotificationProvider is already wrapping the app in App.tsx

// Common Components

// Feature Hooks
import { useAdminData } from '../hooks/useAdminData';

// Feature Components
import TopNavBar from '../components/TopNavBar'; // Corrected path
import Sidebar from '../components/Sidebar'; // Corrected path
import TabContentRenderer from '../components/TabContentRenderer'; // Corrected path

// Feature Tab Components

// Feature Utilities & Types
import { getStaticSectionName } from '../utils/helpers'; // Moved general helper
// Note: Types import might be needed if './types' exists and is used directly

// --- Constants ---
import { pageVariants, pageTransition } from '../../../config/animations'; // Import shared animations

// Removed local animation variants and transition

// Mock data for dashboard widgets (Consider moving to a separate file or fetching if dynamic)

// Navigation items (Consider moving to a configuration file if it grows)
const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', tab: 'dashboard' },
  { icon: <FileText size={20} />, label: 'Pages', tab: 'pages' },
  { icon: <FileEdit size={20} />, label: 'Projects', tab: 'projects' },
  { icon: <Briefcase size={20} />, label: 'Services', tab: 'services' }, // Added Services section
  { icon: <ImageIcon size={20} />, label: 'Media', tab: 'media' }, // Use the alias ImageIcon
  { icon: <ImageIcon size={20} />, label: 'Hero Images', tab: 'heroImages' }, // Added Hero Images section
  { icon: <Link2 size={20} />, label: 'Social Links', tab: 'socialLinks' },
  { icon: <Settings size={20} />, label: 'Settings', tab: 'generalInfo' },
];

// --- Component ---

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile overlay

  // Initialize desktop sidebar state from localStorage, default to false (expanded)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('desktopSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Removed showUserMenu state, now managed within TopNavBar
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // md breakpoint

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Close mobile overlay if resizing to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to save desktop sidebar state to localStorage
  useEffect(() => {
    // Only run this effect if not on mobile, as localStorage is for desktop state
    if (!isMobile) {
      localStorage.setItem('desktopSidebarCollapsed', JSON.stringify(isDesktopSidebarCollapsed));
    }
    // If switching to mobile, ensure the desktop state doesn't affect mobile overlay
    // (localStorage state is ignored when isMobile is true)
  }, [isDesktopSidebarCollapsed, isMobile]);

  // Use the custom hook for data management
  const {
    siteConfig,         // Use new site config state
    translationsData,   // Use new translations state (key-value pairs)
    isLoading,
    saveStatus,
    handleSiteConfigChange, // Use new handler for config
    handleTranslationChange, // Use new handler for individual translations
    saveSiteConfig,         // Use new save function for config
    saveTranslation,        // Use new save function for individual translations
    // resetSiteConfigToDefaults, // Get reset function if needed later
  } = useAdminData();

  // Local UI state
  const [activeTab, setActiveTab] = useState<string | null>('dashboard'); // Default to dashboard
  const [editingPath, setEditingPath] = useState<string | null>(null);
  // const [logoutError, setLogoutError] = useState(''); // Removed unused state


  // Logout handler
  const handleLogout = async () => {
    if (!supabase) {
      console.error("Supabase client instance is not available.");
      alert('Logout service unavailable. Please try again later.');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error; // Throw the error to be caught by the catch block
      }
      // Navigation is handled by the onAuthStateChange listener in ProtectedRoute/LoginPage
      // but we can navigate explicitly here as well for immediate feedback.
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error("Supabase logout failed:", error);
      alert('Failed to log out. Please try again.');
    }
  };


  // Removed renderDashboardContent and renderActiveTabContent functions
  // Their logic is now handled by TabContentRenderer

  // Calculate button disabled state

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {/* TopNavBar styling is likely handled within its own component */}
      <TopNavBar
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
          onToggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleDesktopSidebar={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          onLogout={handleLogout}
        />

        {/* Sidebar and Main Content */}
        <div className="flex pt-16">
          {/* Use the new Sidebar component */}
          <Sidebar
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
            activeTab={activeTab}
            navItems={navItems} // Pass navItems defined above
            onTabClick={(tab) => {
              setActiveTab(tab);
              if (isMobile) {
                setIsSidebarOpen(false); // Close mobile sidebar on tab selection
              }
            }}
            onCloseMobileSidebar={() => setIsSidebarOpen(false)} // Handler for overlay click
          />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${ // Removed pt-0 md:pt-0
            isMobile ? 'ml-0' : (isDesktopSidebarCollapsed ? 'md:ml-20' : 'md:ml-64')
          }`}
        >
          {/* Padding for content area */}
          <div className="p-4 md:p-8">
            {/* Breadcrumb / Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
                {activeTab ? getStaticSectionName(activeTab) : 'Dashboard'}
              </h1>
              {/* Optional: Keep breadcrumb if desired, styled differently */}
              {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Admin / {activeTab ? getStaticSectionName(activeTab) : 'Dashboard'}
              </p> */}
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
              {/* TabContentRenderer likely handles its internal styling */}
              <TabContentRenderer
                activeTab={activeTab}
                isLoading={isLoading}
                // Pass updated data sources and handlers
                siteConfig={siteConfig}
                translationsData={translationsData}
                editingPath={editingPath} // Keep if used by other tabs
                setEditingPath={setEditingPath} // Keep if used by other tabs
                handleSiteConfigChange={handleSiteConfigChange}
                handleTranslationChange={handleTranslationChange}
                // Pass save-related props needed by specific tabs
                saveStatus={saveStatus}
                saveSiteConfig={saveSiteConfig} // Pass the config save function
                saveTranslation={saveTranslation} // Pass the translation save function
                // handleDeleteItem is removed
              />
            </div>

            {/* Save Changes Area Removed */}
          </div>
        </main>
      </div>
      {/* ToastNotification and ConfirmationModal are rendered by NotificationProvider */}
    </motion.div> // Close motion.div
  );
};

export default AdminDashboard;
