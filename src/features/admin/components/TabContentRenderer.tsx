import React from 'react';
// Remove direct icon imports
import IconRenderer from '../../../components/common/IconRenderer'; // Import central renderer

// Import Tab Components
import ProjectsSection from '../sections/Projects/ProjectsSection';
import ServicesSection from '../sections/Services/ServicesSection';
import SocialLinksSection from '../sections/SocialLinks/SocialLinksSection';
import GeneralInfoSection from '../sections/GeneralInfo/GeneralInfoSection';
import PagesSection from '../sections/Pages/PagesSection';
import ImageUploader from '../sections/ImageManagement/components/ImageUploader'; // Corrected path
import HeroImageManagementSection from '../sections/HeroImageManagement/HeroImageManagementSection'; // Added import
import LinkManagementSection from '../sections/LinkManagement/LinkManagementSection'; // Import the new section
import ProductsSection from '../sections/Products/ProductsSection'; // Import Products section

// Import Utilities and Types (Adjust path as necessary)
// Corrected utility and type imports
// Import new types from useAdminData
import { SiteConfigData, TranslationsData } from '../hooks/useAdminData';
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // Import the spinner
import { useDashboardStats, PageViewDataPoint } from '../hooks/useDashboardStats'; // Import the new hook AND PageViewDataPoint from correct file
// Import Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Removed mock stats object

interface TabContentRendererProps {
  activeTab: string | null;
  isLoading: boolean;
  siteConfig: SiteConfigData;         // Use new site config type
  translationsData: TranslationsData;   // Use new translations type (key-value pairs)
  editingPath: string | null;           // Keep if used by other tabs
  setEditingPath: (path: string | null) => void; // Keep if used by other tabs
  // Update handleSiteConfigChange type to exclude link keys (keep if needed for non-input changes)
  handleSiteConfigChange: (key: keyof Omit<SiteConfigData, 'id' | 'updated_at' | 'nav_links' | 'footer_links' | 'footer_links_title'>, value: string | null) => void;
  // Add the generic input handler prop
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  // Add handleLinkListChange prop
  handleLinkListChange: (key: 'nav_links' | 'footer_links', links: { text: string; url: string }[]) => void;
  handleTranslationChange: (key: string, value: string) => void; // Use new handler
  // Pass save-related props needed by specific tabs
  saveStatus: string;
  saveSiteConfig: () => Promise<void>; // Use new save function
  saveTranslation: (key: string, value: string) => Promise<void>; // Add new save function
  // Add setActiveTab prop
  setActiveTab: (tab: string | null) => void;
}

// Helper function to create styled stat cards - Updated type definition
const StatCard: React.FC<{ title: string; value: string; iconName: string; description: string; iconBgColor: string; iconTextColor: string }> =
  ({ title, value, iconName, description, iconBgColor, iconTextColor }) => ( // Use iconName
    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
        <IconRenderer iconName={iconName} size={20} /> {/* Use IconRenderer */}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
);

// Define props for DashboardContent
interface DashboardContentProps {
  setActiveTab: (tab: string | null) => void;
}

// This function now uses the hook to fetch and display stats
const DashboardContent: React.FC<DashboardContentProps> = ({ setActiveTab }) => {
  const { stats, isLoading, error } = useDashboardStats();

  // Define colors for icons
  const iconColors = {
    pageViews: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
    totalPages: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
    totalProjects: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-600 dark:text-indigo-300' },
    totalServices: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-300' }, // Added color for services
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size={32} color="text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading dashboard stats:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
        {/* Optionally add a retry button here that calls refetch() */}
      </div>
    );
  }

  // Format numbers with commas for display
  const formatNumber = (num: number | undefined | null): string => {
    return num?.toLocaleString() ?? '0';
  };

  // Helper to format date for chart axis (e.g., "Apr 13")
  const formatAxisDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Prepare data for the chart, ensuring all last 7 days are present, even with 0 views
  const prepareChartData = (rawData: PageViewDataPoint[]): { date: string; views: number }[] => {
    const chartDataMap = new Map<string, number>();
    const today = new Date();

    // Initialize map with the last 7 days having 0 views
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      chartDataMap.set(dateString, 0);
    }

    // Populate map with actual data
    rawData.forEach(point => {
      chartDataMap.set(point.view_date, point.count);
    });

    // Convert map back to array sorted by date
    return Array.from(chartDataMap.entries()).map(([date, views]) => ({
      date: formatAxisDate(date), // Format date for display
      views,
    }));
  };

  const chartData = stats ? prepareChartData(stats.pageViewsLast7Days) : [];


  return (
    <> {/* Wrap content in a React Fragment */}
      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Page Views (Today)"
        value={formatNumber(stats?.pageViewsToday)} // Use renamed prop
        iconName="Eye"
        description="Requires page view tracking setup"
        iconBgColor={iconColors.pageViews.bg}
        iconTextColor={iconColors.pageViews.text}
      />
      <StatCard
        title="Total Pages"
        value={formatNumber(stats?.totalPages)}
        iconName="FileText"
        description="Published pages count" // Updated description
        iconBgColor={iconColors.totalPages.bg}
        iconTextColor={iconColors.totalPages.text}
      />
      {/* Added Total Projects card */}
      <StatCard
        title="Total Projects"
        value={formatNumber(stats?.totalProjects)}
        iconName="Store"
        description="Published projects count"
        iconBgColor={iconColors.totalProjects.bg}
        iconTextColor={iconColors.totalProjects.text}
      />
      {/* Added Total Services card */}
      <StatCard
        title="Total Services"
        value={formatNumber(stats?.totalServices)}
        iconName="Briefcase" // Example icon, adjust if needed
        description="Published services count"
        iconBgColor={iconColors.totalServices.bg}
        iconTextColor={iconColors.totalServices.text}
      />
    </div>

    {/* Quick Actions Section */}
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add New Page Button */}
        <button
          onClick={() => setActiveTab('pages')}
          className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          <IconRenderer iconName="PlusCircle" size={20} className="mr-2" />
          Add New Page
        </button>

        {/* Add New Project Button */}
        <button
          onClick={() => setActiveTab('projects')}
          className="flex items-center justify-center px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          <IconRenderer iconName="Store" size={20} className="mr-2" />
          Add New Project
        </button>

        {/* Add New Service Button */}
        <button
          onClick={() => setActiveTab('services')}
          className="flex items-center justify-center px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800"
        >
          <IconRenderer iconName="Briefcase" size={20} className="mr-2" />
          Add New Service
        </button>

        {/* Upload Media Button */}
        <button
          onClick={() => setActiveTab('media')}
          className="flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
        >
          <IconRenderer iconName="UploadCloud" size={20} className="mr-2" />
          Upload Media
        </button>
      </div>
    </div>

    {/* Page Views Chart Section */}
    <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Page Views (Last 7 Days)</h2>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600" style={{ height: '300px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5, right: 20, left: -10, bottom: 5, // Adjusted margins
                }}
              >
                {/* Removed dark: styling prefixes */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }} // Tailwind gray-500
                  axisLine={{ stroke: '#d1d5db' }} // Tailwind gray-300
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  allowDecimals={false} // Ensure whole numbers for views
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937' }} // Tailwind gray-800
                  itemStyle={{ color: '#3b82f6' }} // Tailwind blue-500
                />
                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6" // Tailwind blue-500
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  name="Page Views" // Name for Legend and Tooltip
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No page view data available for the last 7 days.
            </div>
          )}
        </div>
      </div>
    </> // Close React Fragment
  );
};


const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  isLoading,
  siteConfig,
  translationsData,
  handleSiteConfigChange, // Destructure this as it's needed by GeneralInfoSection
  handleInputChange, // Destructure the new handler
  handleLinkListChange,
  handleTranslationChange,
  saveStatus,
  saveSiteConfig,
  saveTranslation,
  setActiveTab, // Destructure setActiveTab here
}) => {
  // General isLoading prop is for siteConfig/translations loading, not dashboard stats
  // DashboardContent handles its own loading state internally.

  // Render dashboard if no tab or 'dashboard' is selected
  if (!activeTab || activeTab === 'dashboard') {
    // Render the new DashboardContent component which uses the hook
    // Pass setActiveTab down to DashboardContent
    return <DashboardContent setActiveTab={setActiveTab} />;
  }

  // Loading state for other tabs (non-dashboard)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={48} color="text-indigo-500" />
      </div>
    );
  }

  // Conditional rendering for other tabs remains the same
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
  if (activeTab === 'heroImages') {
    return <HeroImageManagementSection />;
  }
  // Add condition for linkManagement
  if (activeTab === 'linkManagement') {
    return (
      <LinkManagementSection
        siteConfig={siteConfig}
        handleLinkListChange={handleLinkListChange}
        handleInputChange={handleInputChange} // Pass the input handler
        saveSiteConfig={saveSiteConfig}
        isLoading={isLoading}
        saveStatus={saveStatus}
      />
    );
  }
  // Handle generalInfo explicitly here
  if (activeTab === 'generalInfo') {
    return (
      <GeneralInfoSection
          siteConfig={siteConfig} // Pass new prop
          translationsData={translationsData} // Pass new prop
          handleSiteConfigChange={handleSiteConfigChange} // Pass the required handler
          handleInputChange={handleInputChange} // Pass the generic input handler
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
    // Pass the required siteConfig related props down
    return (
      <ProjectsSection
        siteConfig={siteConfig}
        handleInputChange={handleInputChange}
        saveSiteConfig={saveSiteConfig}
        isLoadingConfig={isLoading} // Pass general isLoading as isLoadingConfig
        saveStatusConfig={saveStatus} // Pass general saveStatus as saveStatusConfig
      />
    );
  }
  if (activeTab === 'services') {
    return <ServicesSection />; // Assuming ServicesSection doesn't need props from here for now
  }

  // Add condition for products tab
  if (activeTab === 'products') {
    return <ProductsSection />; // Render the new Products section
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
