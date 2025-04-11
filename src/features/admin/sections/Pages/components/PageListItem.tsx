import React from 'react';
import { Page } from '../types'; // Assuming Page type is in ../types
import { Trash2, Edit, CheckCircle, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'; // Re-added ArrowUp, ArrowDown

// --- Types ---
interface PageListItemProps {
  page: Page;
  index: number;
  pageCount: number;
  isLoading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void; // Re-added
  onMoveDown: (index: number) => void; // Re-added
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
    // Adjusted grid columns for timestamps
    <li key={page.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 border-b text-sm">
      {/* Order Number (col-span-1) */}
      <div className="col-span-1 flex justify-center text-gray-600 font-mono">
        {page.order ?? '-'}
      </div>

      {/* Title / Slug (col-span-4) - Reduced span */}
      <div className="col-span-4">
        <p className="font-medium text-gray-900 truncate">{page.title}</p>
        <p className="text-gray-500 truncate">/{page.slug}</p>
      </div>

      {/* Status (col-span-1, centered) - Reduced span */}
      <div className="col-span-1 flex justify-center">
        {page.is_published ? (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Pub</span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Draft</span>
        )}
      </div>

       {/* Created Date (col-span-2, centered) */}
       <div className="col-span-2 text-center text-gray-500 text-xs">
         {formatDateTime(page.created_at)}
       </div>

       {/* Updated Date (col-span-2, centered) */}
       <div className="col-span-2 text-center text-gray-500 text-xs">
         {formatDateTime(page.updated_at)}
       </div>

      {/* Actions (col-span-2, right-aligned) - Reduced span */}
      <div className="col-span-2 flex justify-end items-center space-x-1">
         {/* Move Up Button */}
         <button
           onClick={() => onMoveUp(index)}
           disabled={isLoading || index === 0}
           className={`p-1 rounded ${isLoading || index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
           title="Move Up"
         >
           <ArrowUp size={18} />
         </button>
         {/* Move Down Button */}
         <button
           onClick={() => onMoveDown(index)}
           disabled={isLoading || index === pageCount - 1}
           className={`p-1 rounded ${isLoading || index === pageCount - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
           title="Move Down"
         >
           <ArrowDown size={18} />
         </button>
        {/* Edit Button */}
        <button
          onClick={() => onEdit(page)}
          disabled={isLoading}
          className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
          title="Edit"
        >
          <Edit size={18} />
        </button>
        {/* Delete Button */}
        {page.id && (
          <button
            onClick={() => onDelete(page.id!)}
            disabled={isLoading}
            className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-100 disabled:opacity-50"
            title="Delete"
          >
          <Trash2 size={18} />
        </button>
        )}
        {/* Publish/Unpublish Button */}
        {page.id && (
          <button
            onClick={() => onTogglePublish(page.id!, page.is_published ?? false)} // Provide default value
            disabled={isLoading}
            className={`p-1 rounded ${
              page.is_published
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100' // Style for "Unpublish"
                : 'text-green-600 hover:text-green-700 hover:bg-green-100' // Style for "Publish"
            } disabled:opacity-50`}
            title={page.is_published ? 'Unpublish' : 'Publish'}
          >
            {page.is_published ? <EyeOff size={18} /> : <CheckCircle size={18} />}
          </button>
        )}
      </div>
    </li>
  );
};

export default PageListItem;
