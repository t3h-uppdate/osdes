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
    translations,
    siteSettings, // Get the new site settings state
    isLoading,
    saveStatus,
    handleTranslationsChange, // Use renamed handler
    handleSiteSettingChange, // Get the new handler
    saveTranslations, // Use renamed save function
    saveSiteSettings, // Get the new save function
    handleDeleteItem,
    // resetSiteSettingsToDefaults, // Get reset functions if needed later
    // resetTranslationsToDefaults,
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
  const isSaveDisabled = isLoading || saveStatus.includes('Saving');

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
                // Pass both data sources and handlers
                translations={translations}
                siteSettings={siteSettings}
                editingPath={editingPath}
                setEditingPath={setEditingPath}
                handleTranslationsChange={handleTranslationsChange}
                handleSiteSettingChange={handleSiteSettingChange}
                handleDeleteItem={handleDeleteItem}
                // Pass other props as needed by TabContentRenderer's children
              />
            </div>

            {/* Save Changes Area */}
            {activeTab && !['dashboard', 'media', 'socialLinks', 'pages', 'projects', 'services'].includes(activeTab) && ( // Example: Only show for Settings/GeneralInfo? Adjust as needed
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
                {saveStatus && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">{saveStatus}</span>
                )}
                <button
                  // Decide which save function to call based on the active tab or combine logic if necessary
                  onClick={async () => {
                    // Example: Conditional saving based on tab
                    if (activeTab === 'generalInfo') {
                       await saveSiteSettings();
                    } else {
                       // Assuming other tabs might save translations? Adjust logic.
                       await saveTranslations();
                    }
                    // Or potentially always save both if changes are tracked globally:
                    // await saveSiteSettings();
                    // await saveTranslations();
                  }}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isSaveDisabled}
                >
                  {isSaveDisabled && saveStatus.includes('Saving') ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* ToastNotification and ConfirmationModal are rendered by NotificationProvider */}
    </motion.div> // Close motion.div
  );
};

export default AdminDashboard;
