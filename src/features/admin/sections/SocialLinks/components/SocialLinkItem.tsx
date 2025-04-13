import React, { useRef } from 'react';
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import IconRenderer from '../../../../../components/common/IconRenderer';
import { SocialLink } from '../types';
import { availableIcons } from '../constants/socialLinkConstants'; // Keep for dropdown

// Define Item Type for react-dnd
const ItemTypes = {
  SOCIAL_LINK: 'social_link',
};

interface SocialLinkItemProps {
  link: SocialLink;
  index: number;
  moveLink: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (index: number, updatedLink: Partial<SocialLink>) => void; // Allow partial updates
  onDelete: (index: number) => void;
}

const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  link,
  index,
  moveLink,
  onUpdate,
  onDelete,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // --- Drag and Drop Logic (similar to LinkManagementSection) ---
  const [, drop] = useDrop<{ index: number }, void, unknown>({
    accept: ItemTypes.SOCIAL_LINK,
    hover(item, monitor: DropTargetMonitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveLink(dragIndex, hoverIndex);
      item.index = hoverIndex; // Update item index as it moves
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SOCIAL_LINK,
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref)); // Combine drag and drop refs

  // --- Input Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate(index, { [name]: value });
  };

  // --- Render ---
  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 shadow-sm ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }} // Visual feedback for dragging
    >
      {/* Drag Handle */}
      <IconRenderer iconName="GripVertical" size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />

      {/* Platform/Name Input */}
      <input
        type="text"
        name="name" // Corresponds to 'platform' in DB but 'name' in SocialLink type
        placeholder="Platform Name"
        value={link.name || ''}
        onChange={handleInputChange}
        className="flex-1 p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
      />

      {/* Icon Select */}
       <div className="flex items-center gap-1">
         <select
           name="icon"
           value={link.icon || ''}
           onChange={handleInputChange}
           className="p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
           aria-label="Select Icon"
         >
           <option value="" disabled>Icon</option>
           {availableIcons.map(iconName => (
             <option key={iconName} value={iconName} className="bg-white dark:bg-gray-700">{iconName}</option>
           ))}
         </select>
         <IconRenderer iconName={link.icon || 'HelpCircle'} size={20} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
       </div>


      {/* URL Input */}
      <input
        type="text" // Changed to text to allow relative paths like '/about' if needed, though social links are usually absolute
        name="url"
        placeholder="Full URL"
        value={link.url || ''}
        onChange={handleInputChange}
        className="flex-1 p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
      />

      {/* Delete Button */}
      <button
        onClick={() => onDelete(index)}
        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        aria-label="Delete social link"
      >
        <IconRenderer iconName="Trash2" size={18} />
      </button>
    </div>
  );
};

export default SocialLinkItem;
