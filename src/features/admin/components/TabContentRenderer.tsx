import React from 'react';
import { Eye, MessageSquare, FileText, Star } from 'lucide-react';

// Import Tab Components
import ProjectsSection from '../sections/Projects/ProjectsSection';
import ServicesSection from '../sections/Services/ServicesSection';
import SocialLinksSection from '../sections/SocialLinks/SocialLinksSection';
import GeneralInfoSection from '../sections/GeneralInfo/GeneralInfoSection';
import PagesSection from '../sections/Pages/PagesSection';
import ImageUploader from '../sections/ImageManagement/components/ImageUploader'; // Corrected path
import HeroImageManagementSection from '../sections/HeroImageManagement/HeroImageManagementSection'; // Added import

// Import Utilities and Types (Adjust path as necessary)
// Corrected utility and type imports
import { renderFields, isValidTranslationKey } from '../sections/GeneralInfo/utils'; // Keep if renderFields is used elsewhere - MAY NEED REFACTORING
import { getStaticSectionName } from '../utils/helpers';
// Import new types from useAdminData
import { SiteConfigData, TranslationsData } from '../hooks/useAdminData';
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
  siteConfig: SiteConfigData;         // Use new site config type
  translationsData: TranslationsData;   // Use new translations type (key-value pairs)
  editingPath: string | null;           // Keep if used by other tabs
  setEditingPath: (path: string | null) => void; // Keep if used by other tabs
  handleSiteConfigChange: (key: keyof Omit<SiteConfigData, 'id' | 'updated_at'>, value: string | null) => void; // Use new handler
  handleTranslationChange: (key: string, value: string) => void; // Use new handler
  // Pass save-related props needed by specific tabs
  saveStatus: string;
  saveSiteConfig: () => Promise<void>; // Use new save function
  saveTranslation: (key: string, value: string) => Promise<void>; // Add new save function
  // handleDeleteItem is removed
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
  siteConfig,         // Use new prop name
  translationsData,   // Use new prop name
  editingPath,
  setEditingPath,
  handleSiteConfigChange, // Use new prop name
  handleTranslationChange, // Use new prop name
  // Destructure new save-related props
  saveStatus,
  saveSiteConfig,
  saveTranslation,
}) => {
  // isLoading is already destructured above
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
    // Assuming ImageUploader doesn't need extra props for general use
    // If it needs onUploadSuccess for specific actions elsewhere, it might need adjustment
    return <ImageUploader onUploadSuccess={(url) => console.log('Uploaded to general media:', url)} />;
  }
  if (activeTab === 'heroImages') { // Added condition for hero images
    return <HeroImageManagementSection />;
  }
  // Handle generalInfo explicitly here
  if (activeTab === 'generalInfo') {
    return (
      <GeneralInfoSection
          siteConfig={siteConfig} // Pass new prop
          translationsData={translationsData} // Pass new prop
          handleSiteConfigChange={handleSiteConfigChange} // Pass new handler
          handleTranslationChange={handleTranslationChange} // Pass new handler
          saveSiteConfig={saveSiteConfig} // Pass new save function
          saveTranslation={saveTranslation} // Pass new save function
          // Pass other necessary props if GeneralInfoSection needs them
          isLoading={isLoading}
          saveStatus={saveStatus}
          // editingPath={editingPath} // Pass if needed by GeneralInfoSection
          // setEditingPath={setEditingPath} // Pass if needed by GeneralInfoSection
          // getStaticSectionName={getStaticSectionName} // Pass if needed
        />
    );
  }

  // Add specific checks for other sections
  if (activeTab === 'projects') {
    return <ProjectsSection />; // Assuming ProjectsSection doesn't need props from here for now
  }
  if (activeTab === 'services') {
    return <ServicesSection />; // Assuming ServicesSection doesn't need props from here for now
  }

  // TODO: Refactor the rendering logic for any remaining tabs that might have used
  // the old renderFields or isValidTranslationKey logic.
  // For now, any other tab will fall through to the error message.

  // Fallback for invalid or unhandled tabs
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
      <p className="text-red-700 dark:text-red-200 font-medium">Error: Invalid or unhandled tab '{activeTab}' selected.</p>
      <p className="text-sm text-red-600 dark:text-red-300 mt-1">Please check the navigation or component logic.</p>
    </div>
  );
};

export default TabContentRenderer;
