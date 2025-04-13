import React, { useState, useEffect, useCallback } from 'react';
// Removed DndProvider imports as we revert away from drag-and-drop for now
import supabase from '../../../../config/supabaseConfig';
import IconRenderer from '../../../../components/common/IconRenderer';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { useTranslations } from '../../../../hooks/useTranslations';
import { SocialLink } from './types';
import SocialLinkItem from './components/SocialLinkItem'; // Keep this
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { socialPlatforms, findPlatform, getDefaultPlatform } from './constants/socialLinkConstants';

// deepEqual helper removed

const SocialLinksSection: React.FC = () => {
  // Added requestConfirmation back
  const { showToast, requestConfirmation } = useNotifications();
  const currentLanguage = 'en';
  const { t, isLoading: isTranslationsLoading, error: translationsError } = useTranslations(currentLanguage);

  // State for links
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  // Removed batch save states (initialLinks, isSavingLinks, isLinksDirty)

  // State for title
  const [title, setTitle] = useState('');
  const [initialTitle, setInitialTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);

  // State for adding a new link (form-like approach without a separate component)
  const [isAdding, setIsAdding] = useState(false);
  // Initialize with the default platform's data
  const [newLinkData, setNewLinkData] = useState(() => {
    const defaultPlatform = getDefaultPlatform();
    return { name: defaultPlatform.name, url: defaultPlatform.baseUrl, icon: defaultPlatform.icon };
  });
  const [isSavingNewLink, setIsSavingNewLink] = useState(false);


  // Constants
  const SOCIAL_LINKS_TABLE = 'social_links';
  const TITLE_TRANSLATION_KEY = 'social.links.title';

  // --- Data Fetching ---
  const fetchLinks = useCallback(async () => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      setIsLoadingLinks(false);
      return;
    }
    setIsLoadingLinks(true);
    try {
      const { data, error } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Map DB 'platform' column to 'name' and 'icon' in the state
      const fetchedLinks: SocialLink[] = data?.map((item, index): SocialLink => {
         const platformInfo = findPlatform(item.platform);
         return {
           id: String(item.id),
           name: platformInfo?.name || item.platform || '', // Use platform name from constants if found
           url: item.url || '',
           icon: platformInfo?.icon || item.platform || 'HelpCircle', // Use platform icon from constants
           order: Number(item.sort_order ?? index)
         };
      }) || [];

      setLinks(fetchedLinks);
    } catch (err: any) {
      console.error("Error fetching social links:", err);
      showToast("Failed to load social links.", 'error');
      setLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [showToast]); // Dependency array updated

  // Fetch initial title
  useEffect(() => {
    if (!isTranslationsLoading && !translationsError) {
      const fetchedTitle = t(TITLE_TRANSLATION_KEY, 'Follow Us');
      setTitle(fetchedTitle);
      setInitialTitle(fetchedTitle);
      setIsTitleDirty(false);
    }
    if (translationsError) {
      console.error("Error loading translations:", translationsError);
      showToast("Error loading section title.", 'error');
      setTitle('Follow Us'); // Fallback
      setInitialTitle('Follow Us');
    }
  }, [t, isTranslationsLoading, translationsError, showToast]);

  // Initial data fetch
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // --- Title Handlers ---
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setIsTitleDirty(event.target.value !== initialTitle);
  };

  const handleSaveTitle = async () => {
     if (!supabase || !isTitleDirty) return;
     setIsSavingTitle(true);
     try {
       const { error } = await supabase
         .from('translations')
         .upsert({ key: TITLE_TRANSLATION_KEY, value: title, language: currentLanguage }, { onConflict: 'key, language' });
       if (error) throw error;
       showToast('Title updated successfully!', 'success');
       setInitialTitle(title);
       setIsTitleDirty(false);
     } catch (error: any) {
       console.error('Error updating title:', error);
       showToast('Failed to update title.', 'error');
     } finally {
       setIsSavingTitle(false);
     }
   };

  // --- Individual Link Handlers ---

  // Handler for saving updates from SocialLinkItem
  const handleUpdateLink = async (id: string, data: Omit<SocialLink, 'id' | 'order'>) => {
    if (!supabase) {
        showToast("Error: Supabase client not initialized.", 'error');
        throw new Error("Supabase client not initialized"); // Throw to indicate failure to item
    }
    console.log(`Updating link ${id} with:`, data);
    try {
        // Save the platform *name* to the database 'platform' column
        const { error } = await supabase
            .from(SOCIAL_LINKS_TABLE)
            .update({
                platform: data.name, // Save the platform name
                url: data.url,
                // icon is derived from platform name, not stored directly
            })
            .eq('id', id);
        if (error) throw error;
        showToast('Link updated successfully!', 'success');
        await fetchLinks(); // Refresh list after update
    } catch (err: any) {
        console.error("Error updating link:", err);
        showToast("Failed to update link. Please try again.", 'error');
        throw err; // Re-throw to indicate failure to item
    }
  };

  // Handler for deleting a link (receives ID from SocialLinkItem)
  const handleDeleteLink = (id: string) => {
    const linkToDelete = links.find(l => l.id === id);
    if (!linkToDelete) return;

    requestConfirmation({
      message: `Are you sure you want to delete the link "${linkToDelete.name}"?`,
      onConfirm: async () => {
        if (!supabase) {
           showToast("Error: Supabase client not initialized.", 'error');
           return;
        }
        try {
          console.log("Attempting to delete link with ID:", id);
          const { error } = await supabase
            .from(SOCIAL_LINKS_TABLE)
            .delete()
            .eq('id', id);

          if (error) {
            console.error("Supabase delete error:", error);
            throw error;
          }

          showToast('Link deleted successfully!', 'success');
          await fetchLinks(); // Refresh list after delete
        } catch (err: any) {
          console.error("Error deleting link from Supabase:", err);
          showToast(err.message || "Failed to delete link. Please try again.", 'error');
        }
      },
      confirmText: 'Delete Link',
      title: 'Confirm Deletion'
    });
  };

  // --- Reordering Handler ---
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) {
      showToast("Error: Supabase client not initialized.", 'error');
      return;
    }

    const linkToMove = links[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= links.length) {
      console.warn("Cannot move item beyond list boundaries.");
      return;
    }

    const linkToSwapWith = links[swapIndex];

    // Optimistic UI update: Swap items locally first
    const newLinks = [...links];
    newLinks[index] = { ...linkToSwapWith, order: linkToMove.order }; // Assign original order of item being moved
    newLinks[swapIndex] = { ...linkToMove, order: linkToSwapWith.order }; // Assign original order of item being swapped with
    setLinks(newLinks); // Update state immediately

    // Update database
    try {
      // Update the item being moved to the target position's original order
      const { error: error1 } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .update({ sort_order: linkToSwapWith.order }) // Use the original order of the item it's swapping with
        .eq('id', linkToMove.id);

      if (error1) throw error1;

      // Update the item being swapped with to the moved item's original order
      const { error: error2 } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .update({ sort_order: linkToMove.order }) // Use the original order of the item that was moved
        .eq('id', linkToSwapWith.id);

      if (error2) throw error2;

      showToast('Link order updated successfully!', 'success');
      // No need to fetch again, optimistic update is usually sufficient
      // If strict consistency is needed, uncomment the fetch:
      // await fetchLinks();
    } catch (err: any) {
      console.error("Error updating link order:", err);
      showToast("Failed to update link order. Reverting changes.", 'error');
      // Revert optimistic update on error
      setLinks([...links]); // Restore original links array
      // Or fetchLinks() to get the definite state from DB
      await fetchLinks();
    }
   };

   // --- Add New Link Handlers ---
   const handleNewPlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const selectedPlatformName = e.target.value;
     const platform = findPlatform(selectedPlatformName);
     if (platform) {
       setNewLinkData({
         name: platform.name,
         icon: platform.icon,
         url: platform.baseUrl === 'mailto:' ? platform.baseUrl : platform.baseUrl, // Set base URL
       });
     }
   };

   const handleNewUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setNewLinkData(prev => ({ ...prev, url: e.target.value }));
   };

   const handleAddNewLink = async () => {
    if (!supabase) {
      showToast("Error: Supabase client not initialized.", 'error');
      return;
    }

    // Validation based on selected platform
    const platform = findPlatform(newLinkData.name);
    if (!platform) {
      showToast("Please select a valid platform.", 'error'); // Should ideally not happen if dropdown is used correctly
      return;
    }
    if (!newLinkData.url) {
       showToast("URL cannot be empty.", 'error');
       return;
    }
    // Check if only the base URL was provided (unless it's mailto:)
    if (newLinkData.url === platform.baseUrl && platform.baseUrl !== 'mailto:') {
       showToast(`Please add your specific username/path/address after "${platform.baseUrl}"`, 'error');
       return;
    }

    setIsSavingNewLink(true);
    try {
      // Determine the next sort order
      const maxOrder = links.reduce((max, link) => Math.max(max, link.order), -1);
      const newOrder = maxOrder + 1;

      // Save the platform *name* to the database 'platform' column
      const { error } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .insert({
          platform: newLinkData.name, // Save platform name
          url: newLinkData.url,
          sort_order: newOrder,
          created_at: new Date().toISOString() // Include created_at if needed by DB
        });

      if (error) throw error;

      showToast('Link added successfully!', 'success');
      setIsAdding(false); // Close add form
      // Reset form to default platform state
      const defaultPlatform = getDefaultPlatform();
      setNewLinkData({ name: defaultPlatform.name, url: defaultPlatform.baseUrl, icon: defaultPlatform.icon });
      await fetchLinks(); // Refresh list
    } catch (err: any) {
      console.error("Error adding link to Supabase:", err);
      showToast(err.message || "Failed to add link. Please try again.", 'error');
    } finally {
      setIsSavingNewLink(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    // Reset form to default platform state
    const defaultPlatform = getDefaultPlatform();
    setNewLinkData({ name: defaultPlatform.name, url: defaultPlatform.baseUrl, icon: defaultPlatform.icon });
  };

  // --- Render ---

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Manage Social Links</h2>

      {/* --- Title Section --- */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
        <label htmlFor="socialLinksTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Section Title
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            id="socialLinksTitle"
            value={title}
            onChange={handleTitleChange}
            disabled={isTranslationsLoading || isSavingTitle}
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            placeholder="e.g., Follow Us"
          />
          <button
            onClick={handleSaveTitle}
            disabled={!isTitleDirty || isSavingTitle || isTranslationsLoading}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {isSavingTitle ? <LoadingSpinner size={16} color="text-white" /> : 'Save Title'}
          </button>
        </div>
        {isTranslationsLoading && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading title...</p>}
      </div>

      {/* --- Links List Section --- */}
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Links</h3>
      {isLoadingLinks && <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading links...</p>}

      {!isLoadingLinks && (
        <div className="mb-4">
          {links.map((link, index) => (
            <SocialLinkItem
               key={link.id}
               index={index}
               link={link}
               totalItems={links.length} // Pass total items count
               onSave={handleUpdateLink}
               onDelete={handleDeleteLink}
               onMove={handleMove} // Pass the move handler
             />
           ))}
        </div>
      )}

      {/* --- Add New Link Section --- */}
      {!isAdding && !isLoadingLinks && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <IconRenderer iconName="Plus" size={18} className="mr-1.5" /> Add New Link
        </button>
      )}

      {isAdding && (
        <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/50">
          <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-100">Add New Link</h4>
          <div className="flex items-center gap-3 mb-3">
             {/* Platform Select Dropdown */}
             <div className="flex items-center gap-1 flex-shrink-0 mr-2">
               <IconRenderer iconName={newLinkData.icon || 'HelpCircle'} size={20} className="text-gray-500 dark:text-gray-400" />
               <select
                 name="name" // Value is the platform name
                 value={newLinkData.name || ''}
                 onChange={handleNewPlatformChange} // Use platform change handler
                 className="p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                 aria-label="Select Platform"
               >
                 {/* <option value="" disabled>Select Platform</option> */} {/* Can be removed if state initializes */}
                 {socialPlatforms.map(platform => (
                   <option key={platform.name} value={platform.name} className="bg-white dark:bg-gray-700">
                     {platform.name}
                   </option>
                 ))}
               </select>
             </div>

             {/* URL Input */}
             <input
               type="text"
               name="url"
               placeholder={
                 findPlatform(newLinkData.name)?.baseUrl
                   ? `e.g., ${findPlatform(newLinkData.name)?.baseUrl}your-username`
                   : "Full URL"
               }
               value={newLinkData.url || ''}
               onChange={handleNewUrlChange} // Use URL change handler
               className="flex-1 p-1.5 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
             />
          </div>
          <div className="flex justify-end gap-3">
             <button
               onClick={handleCancelAdd}
               type="button"
               disabled={isSavingNewLink}
               className="px-4 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
             >
               Cancel
             </button>
             <button
               onClick={handleAddNewLink}
               type="button"
               // Disable based on URL being empty or just the base URL (unless mailto:)
               disabled={
                 isSavingNewLink ||
                 !newLinkData.url ||
                 (newLinkData.url === findPlatform(newLinkData.name)?.baseUrl && newLinkData.url !== 'mailto:')
               }
               className="inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
             >
               {isSavingNewLink ? <LoadingSpinner size={18} className="mr-2" /> : <IconRenderer iconName="PlusCircle" size={18} className="mr-1.5" />}
               {isSavingNewLink ? 'Adding...' : 'Add Link'}
             </button>
           </div>
        </div>
      )}


      {/* Empty State */}
      {!isLoadingLinks && links.length === 0 && !isAdding && (
         <div className="text-center text-gray-500 dark:text-gray-400 mt-6 p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
           <p className="font-medium">No social links defined.</p>
           <p className="text-sm mt-1">Click "Add New Link" above to create one.</p>
         </div>
       )}

    </div>
  );
};

export default SocialLinksSection;
