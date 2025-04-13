import React, { useState, useEffect } from 'react';
import IconRenderer from '../../../../../components/common/IconRenderer';
import { SocialLink } from '../types';
import { socialPlatforms, findPlatform } from '../constants/socialLinkConstants';
import LoadingSpinner from '../../../../../components/common/LoadingSpinner';

interface SocialLinkItemProps {
  link: SocialLink;
  index: number; // Keep index for context if needed, but not for DnD
  onSave: (id: string, data: Omit<SocialLink, 'id' | 'order'>) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void; // Handler for moving item
  totalItems: number; // Total number of items for disabling move buttons
}

const SocialLinkItem: React.FC<SocialLinkItemProps> = ({
  link,
  index, // Current index of this item
  totalItems, // Total number of items
  onSave,
  onDelete,
  onMove, // Function to call when move buttons are clicked
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Omit<SocialLink, 'id' | 'order'>>({
    name: link.name,
    url: link.url,
    icon: link.icon,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update editData if the link prop changes (e.g., after a save/fetch)
  useEffect(() => {
    setEditData({ name: link.name, url: link.url, icon: link.icon });
  }, [link]);

  // Get the current platform object based on the link's name or icon
  // This helps ensure we have the correct baseUrl and icon even if only one was stored previously

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlatformName = e.target.value;
    const platform = findPlatform(selectedPlatformName);
    if (platform) {
      setEditData(prev => ({
        ...prev,
        name: platform.name, // Set name from the selected platform
        icon: platform.icon, // Set icon from the selected platform
        // Reset URL to base URL when platform changes, prompting user to add specifics
        // Keep mailto: as is.
        url: platform.baseUrl === 'mailto:' ? platform.baseUrl : platform.baseUrl,
      }));
    }
  };

 const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData(prev => ({ ...prev, url: e.target.value }));
  };


  const handleEdit = () => {
    setIsEditing(true);
    // Reset edit data to current link state when starting edit
    setEditData({ name: link.name, url: link.url, icon: link.icon });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reset editData, though useEffect handles external changes
   };

   const handleSave = async () => {
      // Validation: Ensure a platform is selected (name exists) and URL is provided
      const platform = findPlatform(editData.name); // Find the platform based on the selected name
      if (!platform) {
        alert("Please select a valid platform.");
        return;
      }
      if (!editData.url) {
         alert("URL cannot be empty.");
         return;
      }
      // Optional: More specific URL validation - check if only the base URL was provided (unless it's mailto:)
      if (editData.url === platform.baseUrl && platform.baseUrl !== 'mailto:') {
         alert(`Please add your specific username/path/address after "${platform.baseUrl}"`);
         return;
      }

      setIsSaving(true);
     try {
       await onSave(link.id, editData);
       setIsEditing(false); // Exit edit mode on successful save
     } catch (error) {
       // Error handling is likely done in the parent via showToast
       console.error("Save failed:", error);
     } finally {
       setIsSaving(false);
     }
   };

  return (
    <div
      className={`flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded mb-2 shadow-sm ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-700'}`}
    >
      {/* Display Mode */}
      {!isEditing && (
        <>
          {/* Reordering Buttons */}
          <div className="flex flex-col items-center justify-center mr-2">
            <button
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
              className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move link up"
            >
              <IconRenderer iconName="ArrowUp" size={16} />
            </button>
            <button
              onClick={() => onMove(index, 'down')}
              disabled={index === totalItems - 1}
              className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move link down"
            >
              <IconRenderer iconName="ArrowDown" size={16} />
            </button>
          </div>

          {/* Link Details */}
          <IconRenderer iconName={link.icon || 'HelpCircle'} size={20} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
          <span className="flex-1 font-medium text-gray-800 dark:text-gray-100 truncate" title={link.name}>{link.name}</span>
          <span className="flex-1 text-sm text-gray-500 dark:text-gray-400 truncate" title={link.url}>{link.url}</span>
          {/* <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-center">{link.order}</span> */} {/* Order display removed for cleaner UI */}

          {/* Action Buttons */}
          <button
            onClick={handleEdit}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Edit social link"
          >
            <IconRenderer iconName="Edit" size={18} />
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete social link"
          >
            <IconRenderer iconName="Trash2" size={18} />
          </button>
        </>
      )}

      {/* Editing Mode */}
      {isEditing && (
        <>
          {/* Placeholder for reorder controls area */}
          <div className="flex flex-col items-center justify-center mr-2 opacity-30">
             <IconRenderer iconName="ArrowUp" size={16} />
              <IconRenderer iconName="ArrowDown" size={16} />
           </div>

           {/* Platform Select Dropdown */}
           <div className="flex items-center gap-1 flex-shrink-0 mr-2">
             {/* Display the icon corresponding to the selected platform */}
             <IconRenderer iconName={editData.icon || 'HelpCircle'} size={20} className="text-gray-500 dark:text-gray-400" />
             <select
               name="name" // The value represents the platform name
               value={editData.name || ''} // Controlled by editData.name
               onChange={handlePlatformChange} // Use the dedicated platform change handler
               className="p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
               aria-label="Select Platform"
             >
               <option value="" disabled>Select Platform</option>
               {socialPlatforms.map(platform => (
                 <option key={platform.name} value={platform.name} className="bg-white dark:bg-gray-700">
                   {platform.name}
                 </option>
               ))}
             </select>
           </div>

           {/* URL Input - Takes remaining space */}
           <input
             type="text"
             name="url"
             // Dynamically set placeholder based on selected platform's base URL
             placeholder={
               findPlatform(editData.name)?.baseUrl
                 ? `e.g., ${findPlatform(editData.name)?.baseUrl}your-username`
                 : "Full URL"
             }
             value={editData.url || ''}
             onChange={handleUrlChange} // Use the dedicated URL change handler
             className="flex-1 p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
           />

          {/* Action Buttons */}
          <button
             onClick={handleSave}
             disabled={isSaving}
             className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
             aria-label="Save changes"
           >
             {isSaving ? <LoadingSpinner size={18} /> : <IconRenderer iconName="Save" size={18} />}
           </button>
           <button
             onClick={handleCancel}
             disabled={isSaving}
             className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
             aria-label="Cancel edit"
           >
             <IconRenderer iconName="XCircle" size={18} />
           </button>
        </>
      )}
    </div>
  );
};

export default SocialLinkItem;
