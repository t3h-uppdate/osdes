import React, { useState, useMemo, useCallback } from 'react'; // Added useState, useMemo, useCallback
import { usePageManagement } from './hooks/usePageManagement'; // Corrected path
import PageForm from './components/PageForm'; // Corrected path
import PageListItem from './components/PageListItem'; // Corrected path
import { Page } from './types'; // Import Page type
import { useAdminData } from '../../hooks/useAdminData'; // Import useAdminData
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import useNotifications for feedback
// Type for filtering publish status
type PublishFilter = 'all' | 'published' | 'draft';
// Type for page category tabs
type PageCategory = 'blog' | 'original';

// --- PagesSection Component ---
const PagesSection: React.FC = () => {
  // Use the updated hook - gets all pages and core handlers
  const {
    allPages, // Renamed from pages
    isLoading: isHookLoading, // Renamed to avoid conflict with component loading state
    isEditing,
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleTogglePublish,
    handleMoveUp,
    handleMoveDown,
  } = usePageManagement();

  // --- Use Admin Data for Blog Title ---
  const {
    siteConfig,
    handleInputChange, // Use the handler from the hook
    saveSiteConfig,    // Use the save function from the hook
    isLoading: isAdminDataLoading, // Rename to avoid conflict with usePageManagement's isLoading
    saveStatus,        // Get save status for feedback
    setSiteConfig,     // Need setter to update local state for input
  } = useAdminData();
  const { showToast } = useNotifications(); // For user feedback

  // Handler specifically for the blog title input
  const handleBlogTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Update the siteConfig state managed by useAdminData directly
    setSiteConfig(prev => ({
        ...prev,
        [name]: value,
    }));
  };

  // Handler for the save button
  const handleSaveBlogTitleClick = async () => {
    // The siteConfig state is already updated by handleBlogTitleChange
    // Now just call the save function from the hook
    await saveSiteConfig();
    // saveSiteConfig already shows toasts on success/error via useNotifications
  };
  // --- End Use Admin Data ---

  // --- Component State for Tabs, Filtering, Pagination ---
  const [activeTab, setActiveTab] = useState<PageCategory>('blog'); // 'blog' or 'original'
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Or make this configurable

  // Reset pagination and filter when tab changes
  const handleTabChange = (tab: PageCategory) => {
    setActiveTab(tab);
    setPublishFilter('all');
    setCurrentPage(1);
  };

  const handlePublishFilterChange = (newFilter: PublishFilter) => {
    setPublishFilter(newFilter);
    setCurrentPage(1); // Reset page when filter changes
  };

  // --- Filtering Logic (based on active tab and publish filter) ---
  const filteredPages = useMemo(() => {
    const categoryFiltered = allPages.filter(page =>
      activeTab === 'original' ? page.is_original_page : !page.is_original_page
    );

    if (publishFilter === 'all') {
      return categoryFiltered;
    }
    const targetStatus = publishFilter === 'published';
    return categoryFiltered.filter(page => (page.is_published ?? false) === targetStatus);
  }, [allPages, activeTab, publishFilter]);

  // --- Pagination Logic ---
  const totalPages = useMemo(() => {
    return Math.ceil(filteredPages.length / itemsPerPage);
  }, [filteredPages.length, itemsPerPage]);

  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPages.slice(startIndex, endIndex);
  }, [filteredPages, currentPage, itemsPerPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);
  // --- End Component State ---


  // Determine loading state based on hook and admin data hook
  const isLoading = isHookLoading || isAdminDataLoading;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Pages & Blog Title</h2>

      {/* --- Blog Title Editor --- */}
      {/* --- Blog Title Editor --- */}
      <div className="p-4 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800 space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Blog Title</h3>
        <input
          type="text"
          name="blogTitle" // Add name attribute to match SiteConfigData key
          value={siteConfig?.blogTitle || ''} // Use value from siteConfig state
          onChange={handleBlogTitleChange} // Use the specific handler
          placeholder="Enter the title for the blog section"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
          disabled={isAdminDataLoading || saveStatus.startsWith('Saving')} // Disable while loading or saving
        />
        <button
          onClick={handleSaveBlogTitleClick} // Use the save handler
          disabled={isAdminDataLoading || saveStatus.startsWith('Saving')} // Disable while loading or saving
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus.startsWith('Saving') ? 'Saving...' : 'Save Blog Title'}
        </button>
        {/* Optional: Display save status */}
        {saveStatus && !saveStatus.startsWith('Saving') && (
             <p className={`text-sm ${saveStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{saveStatus}</p>
        )}
      </div>
      {/* --- End Blog Title Editor --- */}


      {/* Error display removed, handled by toasts */}

      {/* Render PageForm */}
      <PageForm
        key={isEditing || 'add'} // Force re-render/reset when switching between add/edit
        initialData={isEditing ? allPages.find(p => p.id === isEditing) : undefined} // Use allPages
        onSubmit={handleFormSubmit}
        onCancel={resetForm} // Pass resetForm as the cancel handler
        isLoading={isLoading} // Use combined loading state
      />

      {/* --- Tabs and Pages List --- */}
      <div className="mt-6 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
            {(['blog', 'original'] as PageCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                }`}
              >
                {tab === 'blog' ? 'Blog Pages' : 'Original Pages'}
              </button>
            ))}
          </nav>
        </div>

        {/* List Header (Title and Publish Filter) */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
           <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
             {activeTab === 'blog' ? 'Blog Pages' : 'Original Pages'}
           </h3>
          {/* Publish Filter Buttons */}
          <div className="flex space-x-2">
            {(['all', 'published', 'draft'] as PublishFilter[]).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => handlePublishFilterChange(filterOption)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  publishFilter === filterOption // Use component state 'publishFilter'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List Headers */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Order</div>
          <div className="col-span-4">Title / Slug</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-center">Created</div>
          <div className="col-span-2 text-center">Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Page Items - Use paginatedPages */}
        {isLoading && !paginatedPages.length ? ( // Check paginatedPages length
          <p className="p-4 text-gray-500 dark:text-gray-400">Loading pages...</p>
        ) : paginatedPages.length === 0 ? ( // Check paginatedPages length
          <p className="p-4 text-gray-500 dark:text-gray-400">No {activeTab === 'blog' ? 'blog' : 'original'} pages found matching the current filter.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {/* Map over paginatedPages */}
            {paginatedPages.map((page, index) => (
              <PageListItem
                key={page.id}
                page={page}
                // Index and pageCount should reflect the current view (paginated)
                // However, move handlers need the context of the *full* list for the category
                // Let's pass the full filtered list count for move logic bounds
                index={index + (currentPage - 1) * itemsPerPage} // Calculate overall index in filtered list
                pageCount={filteredPages.length} // Use count of the filtered list for bounds
                isLoading={isLoading} // Use combined loading state
                onEdit={startEditing}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </ul>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t dark:border-gray-600">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesSection;
