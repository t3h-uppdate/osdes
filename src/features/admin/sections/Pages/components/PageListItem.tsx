import React from 'react';
import { Page } from '../types'; // Assuming Page type is in ../types
import { Trash2, Edit, CheckCircle, EyeOff } from 'lucide-react'; // Removed ArrowUp, ArrowDown

// --- Types ---
interface PageListItemProps {
  page: Page;
  index: number;
  pageCount: number;
  isLoading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  // onMoveUp: (index: number) => void; // Removed
  // onMoveDown: (index: number) => void; // Removed
  onTogglePublish: (id: string, currentState: boolean) => void; // Added handler for publishing
}

// --- PageListItem Component ---
const PageListItem: React.FC<PageListItemProps> = ({
  page,
  index,
  pageCount,
  isLoading,
  onEdit,
  onDelete,
  // onMoveUp, // Removed
  // onMoveDown, // Removed
  onTogglePublish, // Destructure the new prop
}) => {
  return (
    <li key={page.id} className="p-4 flex justify-between items-center hover:bg-gray-50 border-b"> {/* Added border */}
      <div className="flex items-center space-x-3">
        {/* Order Display (Optional but helpful) */}
        <span className="text-xs font-mono text-gray-400 w-6 text-right">{page.order}</span>
        {/* Page Info */}
        {/* Page Info */}
        <div>
          <p className="font-medium text-gray-900 flex items-center">
            {page.title}
            {/* Publish Status Indicator */}
            {page.is_published ? (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span>
            ) : (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Draft</span>
            )}
          </p>
          <p className="text-sm text-gray-500">/{page.slug}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {/* Move buttons removed */}
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
