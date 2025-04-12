import React from 'react';
import { SocialLink } from '../types'; // Corrected path
// Remove iconComponents import and direct lucide imports
import IconRenderer from '../../../../../components/common/IconRenderer'; // Import central renderer

interface SocialLinkItemProps {
  link: SocialLink;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  link,
  index,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  // Icon name is now directly link.icon, rendered by IconRenderer

  return (
    <div
      // Apply dark mode styles to container and borders
      className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg shadow p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center md:bg-transparent dark:md:bg-transparent md:hover:bg-gray-50 dark:md:hover:bg-gray-700 md:shadow-none md:rounded-none md:border-b md:border-gray-200 dark:md:border-gray-600 md:last:border-b-0 md:py-3 md:px-3 transition-colors duration-150"
    >
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Use IconRenderer */}
            <IconRenderer iconName={link.icon} size={20} className="text-gray-500 dark:text-gray-400 flex-shrink-0" fallbackIcon="HelpCircle" />
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 truncate">{link.name}</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">(Order: {link.order})</span>
        </div>
        <div className="text-sm break-words">
          <span className="font-medium text-gray-500 dark:text-gray-400">URL: </span>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{link.url}</a>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-600 mt-3">
          {/* Action Buttons - Mobile - Use IconRenderer */}
          <button onClick={() => onMoveUp(index)} disabled={isFirst} className={`p-1 rounded ${isFirst ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`} title="Move Up"><IconRenderer iconName="ArrowUp" size={18} /></button>
          <button onClick={() => onMoveDown(index)} disabled={isLast} className={`p-1 rounded ${isLast ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`} title="Move Down"><IconRenderer iconName="ArrowDown" size={18} /></button>
          <button onClick={() => onEdit(link)} className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded" title="Edit"><IconRenderer iconName="Edit" size={18} /></button>
          <button onClick={() => onDelete(link.id)} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded" title="Delete"><IconRenderer iconName="Trash2" size={18} /></button>
        </div>
      </div>

      {/* Desktop Table-like Layout */}
      <div className="hidden md:contents"> {/* Use md:contents for grid layout */}
        <div className="col-span-1 text-center text-gray-700 dark:text-gray-300">{link.order}</div>
        <div className="col-span-1 flex items-center justify-center">
          {/* Use IconRenderer */}
          <IconRenderer iconName={link.icon} size={20} className="text-gray-500 dark:text-gray-400" fallbackIcon="HelpCircle" />
        </div>
        <div className="col-span-3 truncate pr-2 text-gray-800 dark:text-gray-100">{link.name}</div>
        <div className="col-span-4 truncate pr-2">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{link.url}</a>
        </div>
        <div className="col-span-3 flex items-center justify-end gap-1 pr-2"> {/* Added padding */}
          {/* Action Buttons - Desktop - Apply dark mode styles */}
          <button
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className={`p-1 rounded ${isFirst ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            title="Move Up"
          >
            <IconRenderer iconName="ArrowUp" size={18} />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className={`p-1 rounded ${isLast ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            title="Move Down"
          >
            <IconRenderer iconName="ArrowDown" size={18} />
          </button>
          <button onClick={() => onEdit(link)} className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded" title="Edit">
            <IconRenderer iconName="Edit" size={18} />
          </button>
          <button onClick={() => onDelete(link.id)} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded" title="Delete">
            <IconRenderer iconName="Trash2" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinkItem;
