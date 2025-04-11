import React, { useState, useEffect } from 'react';
import { Page } from '../types'; // Corrected path
import QuillEditor from '../../../components/QuillEditor'; // Corrected path
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path

// --- Types ---
interface PageFormProps {
  initialData?: Omit<Page, 'id' | 'order'> & { id?: string; order?: number }; // Allow optional id/order for editing
  onSubmit: (data: Omit<Page, 'id'>) => Promise<void>;
  onCancel?: () => void; // Optional cancel action
  isLoading: boolean;
}

// --- PageForm Component ---
const PageForm: React.FC<PageFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [pageTitle, setPageTitle] = useState(initialData?.title || '');
  const [pageSlug, setPageSlug] = useState(initialData?.slug || '');
  const [pageContent, setPageContent] = useState(initialData?.content || '');
  const { showToast } = useNotifications();

  useEffect(() => {
    // Reset form when initialData changes (e.g., switching from add to edit or cancelling edit)
    setPageTitle(initialData?.title || '');
    setPageSlug(initialData?.slug || '');
    setPageContent(initialData?.content || '');
  }, [initialData]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug || !pageContent) {
      showToast("Title, Slug, and Content are required.", 'error');
      return;
    }
    // Construct data, order will be handled by the parent component logic
    const pageData: Omit<Page, 'id' | 'order'> = {
      title: pageTitle,
      slug: pageSlug,
      content: pageContent,
    };
    // Pass only the core data up, parent decides order and if it's add/update
    onSubmit(pageData as Omit<Page, 'id'>); // Cast needed as parent adds 'order'
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800 space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{initialData?.id ? 'Edit Page' : 'Add New Page'}</h3>
      <div>
        <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
        <input
          type="text"
          id="pageTitle"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          required
          placeholder="Enter page title" // Added placeholder
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="pageSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (URL Path, e.g., 'about-us')</label>
        <input
          type="text"
          id="pageSlug"
          value={pageSlug}
          onChange={handleSlugChange}
          required
          placeholder="e.g., about-us, contact-page" // Added placeholder
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          pattern="^[a-z0-9-]+$"
          title="Slug can only contain lowercase letters, numbers, and hyphens."
        />
      </div>
      {/* Apply dark mode label color. Quill editor styling might need theme prop or CSS overrides */}
      <div className="relative quill-editor-wrapper">
        <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
        <QuillEditor
          value={pageContent}
          onChange={setPageContent}
          placeholder="Enter page content here..."
          // Consider passing a theme prop to QuillEditor if it supports it
          // theme={currentTheme === 'dark' ? 'snow' : 'bubble'} // Example
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        {initialData?.id && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
          >
            Cancel Edit
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (initialData?.id ? 'Update Page' : 'Add Page')}
        </button>
      </div>
    </form>
  );
};

export default PageForm;
