import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import supabase from '../../../../config/supabaseConfig';
import IconRenderer from '../../../../components/common/IconRenderer';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { useTranslations } from '../../../../hooks/useTranslations';
import { SocialLink } from './types';
// Removed SocialLinkForm import
import SocialLinkItem from './components/SocialLinkItem'; // Keep this
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import { availableIcons } from './constants/socialLinkConstants'; // Needed for default new link

// Helper to check deep equality for objects (simplified)
const deepEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const SocialLinksSection: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const currentLanguage = 'en';
  const { t, isLoading: isTranslationsLoading, error: translationsError } = useTranslations(currentLanguage);

  // State for links
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [initialLinks, setInitialLinks] = useState<SocialLink[]>([]); // Store initial state for comparison
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSavingLinks, setIsSavingLinks] = useState(false); // Loading state for batch save
  const [isLinksDirty, setIsLinksDirty] = useState(false); // Track if links list has changed

  // State for title
  const [title, setTitle] = useState('');
  const [initialTitle, setInitialTitle] = useState(''); // Store initial title
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);

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

      const fetchedLinks: SocialLink[] = data?.map((item, index): SocialLink => ({
        id: String(item.id), // Keep ID from DB
        name: item.platform || '', // Ensure defaults
        url: item.url || '',
        icon: item.platform || '', // Use platform as icon default if needed
        order: Number(item.sort_order ?? index) // Use index as fallback order
      })) || [];

      setLinks(fetchedLinks);
      setInitialLinks(JSON.parse(JSON.stringify(fetchedLinks))); // Deep copy for initial state
      setIsLinksDirty(false); // Reset dirty state on fetch
    } catch (err: any) {
      console.error("Error fetching social links:", err);
      showToast("Failed to load social links.", 'error');
      setLinks([]);
      setInitialLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [showToast]);

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

  // Check if links are dirty whenever links state changes
  useEffect(() => {
    // Compare current links with initial links (consider order)
    if (links.length !== initialLinks.length) {
      setIsLinksDirty(true);
      return;
    }
    for (let i = 0; i < links.length; i++) {
      // Compare relevant fields, ignore temporary IDs for new items
      const current = { name: links[i].name, url: links[i].url, icon: links[i].icon, id: links[i].id };
      const initial = { name: initialLinks[i].name, url: initialLinks[i].url, icon: initialLinks[i].icon, id: initialLinks[i].id };
      if (!deepEqual(current, initial)) {
        setIsLinksDirty(true);
        return;
      }
    }
    // If loop completes without finding differences
    setIsLinksDirty(false);
  }, [links, initialLinks]);


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
       setInitialTitle(title); // Update initial state on success
       setIsTitleDirty(false);
     } catch (error: any) {
       console.error('Error updating title:', error);
       showToast('Failed to update title.', 'error');
     } finally {
       setIsSavingTitle(false);
     }
   };

  // --- Link List Handlers (Inline Editing) ---
  const handleUpdateLink = (index: number, updatedData: Partial<SocialLink>) => {
    setLinks(currentLinks => {
      const newLinks = [...currentLinks];
      newLinks[index] = { ...newLinks[index], ...updatedData };
      return newLinks;
    });
    // No need to set dirty here, useEffect handles it
  };

  const handleDeleteLink = (index: number) => {
    // No confirmation here, deletion happens on Save Changes
    setLinks(currentLinks => currentLinks.filter((_, i) => i !== index));
    // No need to set dirty here, useEffect handles it
  };

  const handleAddLink = () => {
    const newLink: SocialLink = {
      // Use a temporary ID for keys, it won't be saved to DB
      id: `temp-${Date.now()}`,
      name: '',
      url: '',
      icon: availableIcons[0] || '', // Default icon
      order: links.length // Assign next order temporarily
    };
    setLinks(currentLinks => [...currentLinks, newLink]);
    // No need to set dirty here, useEffect handles it
  };

  const handleMoveLink = useCallback((dragIndex: number, hoverIndex: number) => {
    setLinks(currentLinks => {
      const draggedLink = currentLinks[dragIndex];
      const updatedLinks = [...currentLinks];
      updatedLinks.splice(dragIndex, 1);
      updatedLinks.splice(hoverIndex, 0, draggedLink);
      // Reassign order based on new position
      return updatedLinks.map((link, idx) => ({ ...link, order: idx }));
    });
    // No need to set dirty here, useEffect handles it
  }, []);

  // --- Batch Save Logic ---
  const handleSaveChanges = async () => {
    if (!supabase) {
      showToast("Error: Supabase client not initialized.", 'error');
      return;
    }
    setIsSavingLinks(true);

    try {
      const operations: Promise<any>[] = [];

      // 1. Determine Deletes
      const initialIds = new Set(initialLinks.map(l => l.id).filter(id => id && !id.startsWith('temp-'))); // Ensure IDs exist and are not temp
      const currentIds = new Set(links.map(l => l.id).filter(id => id && !id.startsWith('temp-'))); // Ignore temp IDs
      const idsToDelete = [...initialIds].filter(id => !currentIds.has(id));


      if (idsToDelete.length > 0) {
        console.log("Deleting IDs:", idsToDelete);
        operations.push(
          supabase.from(SOCIAL_LINKS_TABLE).delete().in('id', idsToDelete)
        );
      }

      // 2. Determine Updates and Inserts
      const linksToUpsert = links
        .map((link, index) => ({
            id: link.id?.startsWith('temp-') ? undefined : link.id, // Remove temp IDs for insert
            platform: link.name, // Map state 'name' back to DB 'platform'
            url: link.url,
            icon: link.icon, // Assuming icon name is stored directly or mapped from platform
            sort_order: index, // Use current index as the definitive order
        }))
        .filter(link => {
            // Only upsert if it's new or changed from initial state
            if (!link.id) return true; // It's new
            const initialLink = initialLinks.find(l => l.id === link.id);
            if (!initialLink) return true; // Should not happen if ID exists, but safety check
            // Compare relevant fields (platform, url, icon, sort_order)
            return link.platform !== initialLink.name ||
                   link.url !== initialLink.url ||
                   link.icon !== initialLink.icon ||
                   link.sort_order !== initialLink.order;
        });


      if (linksToUpsert.length > 0) {
         console.log("Upserting Links:", linksToUpsert);
         operations.push(
           supabase.from(SOCIAL_LINKS_TABLE).upsert(linksToUpsert, { onConflict: 'id' })
         );
      }

      // Execute all operations if any exist
      if (operations.length > 0) {
          const results = await Promise.allSettled(operations);
          console.log("Batch operation results:", results);

          // Check for errors
          const errors = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.error));
          if (errors.length > 0) {
            console.error("Error saving social links:", errors);
            // Attempt to extract specific Supabase error messages
            const errorMessages = errors.map(e => {
                if (e.status === 'rejected') return e.reason?.message || 'Unknown rejection';
                if (e.status === 'fulfilled' && e.value?.error) return e.value.error.message;
                return 'Unknown error';
            }).join('; ');
            throw new Error(`Failed to save some links: ${errorMessages}`);
          }
          showToast('Social links saved successfully!', 'success');
      } else {
          // Changed 'info' to 'success' for showToast type compatibility
          showToast('No changes to save.', 'success');
      }


      // Refresh data from DB regardless of save to get new IDs and confirm state
      await fetchLinks(); // This resets initialLinks and dirty state

    } catch (error: any) {
      console.error('Error in handleSaveChanges:', error);
      showToast(error.message || 'Failed to save social links. Please try again.', 'error');
    } finally {
      setIsSavingLinks(false);
    }
  };


  // --- Render ---
  const isLoading = isLoadingLinks || isTranslationsLoading;
  // Combined save button disabled logic
  const isSaveDisabled = isLoading || isSavingLinks || isSavingTitle || !isLinksDirty;


  return (
    // Wrap with DndProvider
    <DndProvider backend={HTML5Backend}>
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
            {/* Title Save Button - Separate from main save */}
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
                key={link.id} // Use DB id or temp id as key
                index={index}
                link={link}
                moveLink={handleMoveLink}
                onUpdate={handleUpdateLink}
                onDelete={handleDeleteLink}
              />
            ))}
          </div>
        )}

        {/* Add New Link Button */}
        {!isLoadingLinks && (
          <button
            onClick={handleAddLink}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <IconRenderer iconName="Plus" size={18} className="mr-1.5" /> Add New Link
          </button>
        )}

        {/* Empty State */}
        {!isLoadingLinks && links.length === 0 && (
           <div className="text-center text-gray-500 dark:text-gray-400 mt-6 p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
             <p className="font-medium">No social links defined.</p>
             <p className="text-sm mt-1">Click "Add New Link" above to create one.</p>
           </div>
         )}

        {/* --- Save All Changes Area --- */}
         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
            {/* Optional: Display dirty status */}
            {isLinksDirty && !isSavingLinks && (
                <span className="text-sm italic text-yellow-600 dark:text-yellow-400">Unsaved link changes</span>
            )}
           <button
             onClick={handleSaveChanges}
             className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             disabled={isSaveDisabled} // Use combined disabled logic
           >
             {isSavingLinks ? (
               <>
                 <LoadingSpinner size={20} color="text-white" className="-ml-1 mr-2" />
                 Saving Links...
               </>
             ) : (
                <>
                 <IconRenderer iconName="Save" size={18} className="mr-1.5" />
                 Save Link Changes
                </>
             )}
           </button>
         </div>

      </div>
    </DndProvider>
  );
};

export default SocialLinksSection;
