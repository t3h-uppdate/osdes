import React from 'react';
import { usePageManagement } from './hooks/usePageManagement'; // Corrected path
import PageForm from './components/PageForm'; // Corrected path
import PageListItem from './components/PageListItem'; // Corrected path
// Removed sorting icons import


// --- PagesTab Component ---
const PagesSection: React.FC = () => {
  // Use the custom hook to manage state and logic
  const {
    pages,
    isLoading,
    isEditing,
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleTogglePublish,
    handleMoveUp,
    handleMoveDown,
    filter,
    handleFilterChange,
    currentPage, // Get pagination state
    totalPages, // Get pagination state
    goToNextPage, // Get pagination handlers
    goToPreviousPage, // Get pagination handlers
  } = usePageManagement();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Pages</h2>

      {/* Error display removed, handled by toasts */}

      {/* Render PageForm */}
      <PageForm
        key={isEditing || 'add'} // Force re-render/reset when switching between add/edit
        initialData={isEditing ? pages.find(p => p.id === isEditing) : undefined}
        onSubmit={handleFormSubmit}
        onCancel={resetForm} // Pass resetForm as the cancel handler
        isLoading={isLoading}
      />

      {/* Pages List */}
      <div className="mt-6 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Existing Pages</h3>
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {(['all', 'published', 'draft'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => handleFilterChange(filterOption)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === filterOption
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

        {/* Page Items */}
        {isLoading && !pages.length ? (
          <p className="p-4 text-gray-500 dark:text-gray-400">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-400">No pages found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {pages.map((page, index) => (
              <PageListItem
                key={page.id}
                page={page}
                index={index}
                pageCount={pages.length}
                isLoading={isLoading}
                onEdit={startEditing}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp} // Pass move handlers
                onMoveDown={handleMoveDown} // Pass move handlers
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
