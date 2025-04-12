import React from 'react';
import { Page } from '../types'; // Assuming Page type is in ../types
// Remove direct icon imports
import IconRenderer from '../../../../../components/common/IconRenderer'; // Import central renderer

// --- Types ---
interface PageListItemProps {
  page: Page;
  index: number; // Keep index for disabling buttons, but don't use for move logic
  pageCount: number;
  isLoading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void; // Changed to accept id
  onMoveDown: (id: string) => void; // Changed to accept id
  onTogglePublish: (id: string, currentState: boolean) => void;
}

// --- PageListItem Component ---
const PageListItem: React.FC<PageListItemProps> = ({
  page,
  index,
  pageCount,
  isLoading,
  onEdit,
  onDelete,
  onMoveUp, // Re-added
  onMoveDown, // Re-added
  onTogglePublish,
}) => {
  // Helper to format date and time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      // More detailed format, adjust as needed
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    // Apply dark mode styles to list item hover and border
    <li key={page.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-600 text-sm">
      {/* Order Number (col-span-1) */}
      <div className="col-span-1 flex justify-center text-gray-600 dark:text-gray-400 font-mono">
        {page.order ?? '-'}
      </div>

      {/* Title / Slug (col-span-4) */}
      <div className="col-span-4">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{page.title}</p>
        <p className="text-gray-500 dark:text-gray-400 truncate">/{page.slug}</p>
      </div>

      {/* Status (col-span-1, centered) */}
      <div className="col-span-1 flex justify-center">
        {page.is_published ? (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-1.5 py-0.5 rounded-full">Pub</span>
        ) : (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">Draft</span>
        )}
      </div>

       {/* Created Date (col-span-2, centered) */}
       <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 text-xs">
         {formatDateTime(page.created_at)}
       </div>

       {/* Updated Date (col-span-2, centered) */}
       <div className="col-span-2 text-center text-gray-500 dark:text-gray-400 text-xs">
         {formatDateTime(page.updated_at)}
       </div>

      {/* Actions (col-span-2, right-aligned) */}
      <div className="col-span-2 flex justify-end items-center space-x-1">
         {/* Move Up Button */}
         <button
           onClick={() => page.id && onMoveUp(page.id)} // Pass page.id
           disabled={isLoading || index === 0 || !page.id} // Disable if no id
            className={`p-1 rounded ${isLoading || index === 0 || !page.id ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-600'}`}
            title="Move Up"
          >
            <IconRenderer iconName="ArrowUp" size={18} />
          </button>
          {/* Move Down Button */}
          <button
            onClick={() => page.id && onMoveDown(page.id)} // Pass page.id
            disabled={isLoading || index === pageCount - 1 || !page.id} // Disable if no id
            className={`p-1 rounded ${isLoading || index === pageCount - 1 || !page.id ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-600'}`}
            title="Move Down"
          >
            <IconRenderer iconName="ArrowDown" size={18} />
          </button>
         {/* Edit Button */}
         <button
          onClick={() => onEdit(page)}
          disabled={isLoading}
           className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-gray-600 disabled:opacity-50"
           title="Edit"
         >
           <IconRenderer iconName="Edit" size={18} />
         </button>
         {/* Delete Button */}
        {page.id && (
          <button
            onClick={() => onDelete(page.id!)}
            disabled={isLoading}
             className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-gray-600 disabled:opacity-50"
             title="Delete"
           >
           <IconRenderer iconName="Trash2" size={18} />
         </button>
         )}
        {/* Publish/Unpublish Button */}
        {page.id && (
          <button
            onClick={() => onTogglePublish(page.id!, page.is_published ?? false)} // Provide default value
            disabled={isLoading}
            className={`p-1 rounded ${
              page.is_published
                ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-gray-600' // Style for "Unpublish"
                : 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-gray-600' // Style for "Publish"
             } disabled:opacity-50`}
             title={page.is_published ? 'Unpublish' : 'Publish'}
           >
             {page.is_published ? <IconRenderer iconName="EyeOff" size={18} /> : <IconRenderer iconName="CheckCircle" size={18} />}
           </button>
         )}
      </div>
    </li>
  );
};

export default PageListItem;
