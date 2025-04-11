import React from 'react';
import { Eye, MessageSquare, FileText, Star } from 'lucide-react';

// Import Tab Components
import ProjectsSection from '../sections/Projects/ProjectsSection';
import ServicesSection from '../sections/Services/ServicesSection';
import SocialLinksSection from '../sections/SocialLinks/SocialLinksSection';
import GeneralInfoSection from '../sections/GeneralInfo/GeneralInfoSection';
import PagesSection from '../sections/Pages/PagesSection';
import ImageUploader from '../sections/ImageManagement/components/ImageUploader'; // Corrected path

// Import Utilities and Types (Adjust path as necessary)
// Corrected utility and type imports
import { renderFields, isValidTranslationKey } from '../sections/GeneralInfo/utils'; // Keep if renderFields is used elsewhere
import { getStaticSectionName } from '../utils/helpers';
import { TranslationsType } from '../../../types/translations';
// Import SiteSettingsData type
import { SiteSettingsData } from '../hooks/useAdminData'; // Assuming it's exported from hook
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // Import the spinner

// Mock data for dashboard widgets (Should ideally come from props or context)
const stats = {
  pageViews: '1,234',
  totalPages: '12',
  comments: '45',
  averageRating: '4.8'
};

interface TabContentRendererProps {
  activeTab: string | null;
  isLoading: boolean;
  translations: TranslationsType;
  siteSettings: SiteSettingsData; // Add siteSettings prop
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  handleTranslationsChange: (path: (string | number)[], value: string | string[]) => void; // Use renamed handler
  handleSiteSettingChange: (key: keyof SiteSettingsData, value: string) => void; // Add site settings handler
  handleDeleteItem: (path: (string | number)[], index?: number) => void;
}

// Helper function to create styled stat cards
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string; iconBgColor: string; iconTextColor: string }> =
  ({ title, value, icon, description, iconBgColor, iconTextColor }) => (
    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
);


const renderDashboardContent = () => {
  // Define colors for icons
  const iconColors = {
    pageViews: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
    totalPages: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
    comments: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-300' },
    averageRating: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatCard
        title="Page Views"
        value={stats.pageViews}
        icon={<Eye size={20} />}
        description="Last 30 days"
        iconBgColor={iconColors.pageViews.bg}
        iconTextColor={iconColors.pageViews.text}
      />
      <StatCard
        title="Total Pages"
        value={stats.totalPages}
        icon={<FileText size={20} />}
        description="Published content"
        iconBgColor={iconColors.totalPages.bg}
        iconTextColor={iconColors.totalPages.text}
      />
      <StatCard
        title="Comments"
        value={stats.comments}
        icon={<MessageSquare size={20} />}
        description="Awaiting response"
        iconBgColor={iconColors.comments.bg}
        iconTextColor={iconColors.comments.text}
      />
      <StatCard
        title="Average Rating"
        value={stats.averageRating}
        icon={<Star size={20} />}
        description="Based on feedback"
        iconBgColor={iconColors.averageRating.bg}
        iconTextColor={iconColors.averageRating.text}
      />
    </div>
  );
};


const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  isLoading,
  translations,
  siteSettings, // Destructure new prop
  editingPath,
  setEditingPath,
  handleTranslationsChange, // Use renamed handler
  handleSiteSettingChange, // Destructure new handler
  handleDeleteItem,
}) => {
  if (isLoading) {
    // Use the reusable LoadingSpinner component
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={48} color="text-indigo-500" /> {/* Use the spinner */}
      </div>
    );
  }

  // Render dashboard if no tab or 'dashboard' is selected
  if (!activeTab || activeTab === 'dashboard') {
    return renderDashboardContent();
  }

  // Corrected conditional rendering structure
  if (activeTab === 'socialLinks') {
    return <SocialLinksSection />;
  }
  if (activeTab === 'pages') {
    return <PagesSection />;
  }
  if (activeTab === 'media') {
    return <ImageUploader />;
  }
  // Handle generalInfo explicitly here
  if (activeTab === 'generalInfo') {
    // No need for isValidTranslationKey check for this specific tab
    // const staticTabTitle = getStaticSectionName(activeTab); // Title is handled by AdminDashboard now
    return (
      // Return the GeneralInfoSection directly, wrapped in a fragment if needed (though likely not here)
      <GeneralInfoSection
          siteSettings={siteSettings}
          handleSiteSettingChange={handleSiteSettingChange}
          translations={translations}
          handleTranslationsChange={handleTranslationsChange}
          editingPath={editingPath}
          setEditingPath={setEditingPath}
          getStaticSectionName={getStaticSectionName}
        />
      // No fragment needed here as it's a single component return
    );
  }

  // Check if the activeTab corresponds to *other* sections that might use renderFields
  if (isValidTranslationKey(activeTab)) { // Now activeTab cannot be 'generalInfo', 'projects', 'services' etc. here
    // const staticTabTitle = getStaticSectionName(activeTab); // Title handled by AdminDashboard
    return (
      // Return within a Fragment as there's conditional logic inside
      <>
        {/* Render specific sections first */}
        {activeTab === 'projects' ? (
          <ProjectsSection />
        ) : activeTab === 'services' ? (
          <ServicesSection />
        ) : // Fallback rendering logic for remaining valid translation keys using renderFields
        translations.en[activeTab] ? ( // Check existence just in case
          renderFields(
              translations.en[activeTab], // The data object
              [activeTab], // Base path
              handleTranslationsChange, // Handler
              editingPath, // Current editing state
              setEditingPath,
              undefined, // handleAdd - might need specific handlers
              handleDeleteItem
            )
          ) : null // Fallback renders null if key doesn't exist in translations
        }
      </> // Ensure Fragment is closed correctly
    );
  }

  // Fallback for invalid or unhandled tabs
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
      <p className="text-red-700 dark:text-red-200 font-medium">Error: Invalid or unhandled tab '{activeTab}' selected.</p>
      <p className="text-sm text-red-600 dark:text-red-300 mt-1">Please check the navigation or component logic.</p>
    </div>
  );
};

export default TabContentRenderer;
