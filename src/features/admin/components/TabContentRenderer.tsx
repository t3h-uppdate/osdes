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

const renderDashboardContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Page Views */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Page Views</h3>
          <Eye className="text-blue-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.pageViews}</p>
        <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
      </div>
      {/* Total Pages */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Total Pages</h3>
          <FileText className="text-green-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.totalPages}</p>
        <p className="text-sm text-gray-500 mt-2">Published content</p>
      </div>
      {/* Comments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Comments</h3>
          <MessageSquare className="text-purple-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
        <p className="text-sm text-gray-500 mt-2">Awaiting response</p>
      </div>
      {/* Average Rating */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Average Rating</h3>
          <Star className="text-yellow-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
        <p className="text-sm text-gray-500 mt-2">Based on feedback</p>
      </div>
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
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    const staticTabTitle = getStaticSectionName(activeTab);
    return (
      <>
        <h3 className="text-xl font-semibold mb-4 text-gray-700 capitalize">
          {staticTabTitle}
        </h3>
        {/* Render GeneralInfoSection directly when activeTab is 'generalInfo' */}
        <GeneralInfoSection
          siteSettings={siteSettings}
          handleSiteSettingChange={handleSiteSettingChange}
          translations={translations}
          handleTranslationsChange={handleTranslationsChange}
          editingPath={editingPath}
          setEditingPath={setEditingPath}
          getStaticSectionName={getStaticSectionName}
        />
      </>
    );
  }

  // Check if the activeTab corresponds to *other* sections in translations
  if (isValidTranslationKey(activeTab)) { // Now activeTab cannot be 'generalInfo' here
    const staticTabTitle = getStaticSectionName(activeTab);
    return (
      <>
        <h3 className="text-xl font-semibold mb-4 text-gray-700 capitalize">
          {staticTabTitle}
        </h3>
        {/* Removed the incorrect check for activeTab === 'projects' inside the generalInfo block */}
        {activeTab === 'projects' ? (
          <ProjectsSection />
        ) : activeTab === 'services' ? (
          <ServicesSection />
        ) : /* No 'generalInfo' case needed here anymore */
          // Fallback rendering logic for remaining valid translation keys
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
      </>
    );
  }

  // Fallback for invalid tabs
  return <p className="text-red-500">Error: Invalid tab '{activeTab}' selected.</p>;
};

export default TabContentRenderer;
