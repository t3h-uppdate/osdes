import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../config/supabaseConfig'; // Import Supabase client
import { PlusCircle } from 'lucide-react';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { SocialLink } from './types'; // Corrected path (assuming type matches useSocialLinks)
import SocialLinkForm from './components/SocialLinkForm'; // Corrected path
import SocialLinkItem from './components/SocialLinkItem'; // Corrected path

const SocialLinksSection: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  // State to hold data for the form when editing (using SocialLink type, id is ignored on add)
  const [currentEditData, setCurrentEditData] = useState<SocialLink | null>(null);

  // Define Supabase table name
  const SOCIAL_LINKS_TABLE = 'social_links';

  const fetchLinks = useCallback(async () => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Map Supabase data to the SocialLink interface (consistent with useSocialLinks hook)
      const fetchedLinks = data?.map(item => ({
        id: String(item.id),
        name: item.platform,
        url: item.url,
        icon: item.platform,
        order: item.sort_order
      })) || [];
      setLinks(fetchedLinks);
    } catch (err: any) {
      console.error("Error fetching social links from Supabase:", err);
      showToast("Failed to load social links. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]); // supabase is stable, no need to include

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const resetFormState = () => {
    setIsAdding(false);
    setEditingLinkId(null);
    setCurrentEditData(null);
  };

  // formData is Omit<SocialLink, 'id'> - comes from the form
  const handleAddLink = async (formData: Omit<SocialLink, 'id'>) => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      return;
    }
    try {
      // Calculate new sort_order
      const newOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0;
      // Map form data (name, url) to Supabase columns (platform, url)
      const { error } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .insert({
          platform: formData.name, // Use name from form
          url: formData.url,       // Use url from form
          sort_order: newOrder     // Use calculated order
        });

      if (error) throw error;

      showToast('Link added successfully!', 'success');
      resetFormState();
      fetchLinks(); // Refresh list
    } catch (err: any) {
      console.error("Error adding link to Supabase:", err);
      showToast("Failed to add link. Please try again.", 'error');
    }
  };

  // formData is Omit<SocialLink, 'id'> - comes from the form
  const handleUpdateLink = async (formData: Omit<SocialLink, 'id'>) => {
    if (!editingLinkId || !supabase) {
      showToast("Error: Cannot update link or Supabase client is not initialized.", 'error');
      return;
    }
    try {
      // Map form data (name, url, order) to Supabase columns (platform, url, sort_order)
      const { error } = await supabase
        .from(SOCIAL_LINKS_TABLE)
        .update({
          platform: formData.name,    // Use name from form
          url: formData.url,          // Use url from form
          sort_order: formData.order  // Use order from form
        })
        .eq('id', editingLinkId); // Match the ID

      if (error) throw error;

      showToast('Link updated successfully!', 'success');
      resetFormState();
      fetchLinks(); // Refresh list
    } catch (err: any) {
      console.error("Error updating link in Supabase:", err);
      showToast("Failed to update link. Please try again.", 'error');
    }
  };

  // Reordering using two separate updates
  const handleMove = async (index: number, direction: 'up' | 'down') => {
     if (!supabase) {
        showToast("Error: Supabase client is not initialized.", 'error');
        return;
     }
     const swapIndex = direction === 'up' ? index - 1 : index + 1;
     if (swapIndex < 0 || swapIndex >= links.length) return;

     const linkToMove = links[index];
     const linkToSwapWith = links[swapIndex];

     try {
       // Perform updates sequentially
       const { error: error1 } = await supabase
         .from(SOCIAL_LINKS_TABLE)
         .update({ sort_order: linkToSwapWith.order }) // Give linkToMove the order of linkToSwapWith
         .eq('id', linkToMove.id);
       if (error1) throw error1;

       const { error: error2 } = await supabase
         .from(SOCIAL_LINKS_TABLE)
         .update({ sort_order: linkToMove.order }) // Give linkToSwapWith the original order of linkToMove
         .eq('id', linkToSwapWith.id);
       if (error2) throw error2;

       showToast(`Link moved ${direction} successfully.`, 'success');
       fetchLinks(); // Refresh list with new order
     } catch (err: any) {
       console.error(`Error moving link ${direction} in Supabase:`, err);
       showToast("Failed to reorder link. Please try again.", 'error');
       // Note: If one update fails, the order might be temporarily inconsistent. Fetching should resolve.
     }
   };

  const handleMoveUp = (index: number) => handleMove(index, 'up');
  const handleMoveDown = (index: number) => handleMove(index, 'down');

  const handleDeleteLink = async (id: string) => {
    const linkToDelete = links.find(l => l.id === id);
    if (!linkToDelete) return;

    requestConfirmation({
      message: `Are you sure you want to delete the link "${linkToDelete.name}"?`,
      onConfirm: async () => {
        if (!supabase) {
           showToast("Error: Supabase client is not initialized.", 'error');
           return;
        }
        try {
          const { error } = await supabase
            .from(SOCIAL_LINKS_TABLE)
            .delete()
            .eq('id', id);

          if (error) throw error;

          showToast('Link deleted successfully!', 'success');
          fetchLinks(); // Refresh list
          if (editingLinkId === id) {
            resetFormState();
          }
        } catch (err: any) {
          console.error("Error deleting link from Supabase:", err);
          showToast("Failed to delete link. Please try again.", 'error');
        }
      },
      confirmText: 'Delete Link',
      title: 'Confirm Deletion'
    });
  };

  const startEditing = (link: SocialLink) => {
    setEditingLinkId(link.id);
    // Set the full link object for the form
    setCurrentEditData(link);
    setIsAdding(false);
  };

  // Form submits Omit<SocialLink, 'id'>
  const handleFormSubmit = (formData: Omit<SocialLink, 'id'>) => {
    if (editingLinkId) {
      // Pass the form data directly to handleUpdateLink
      handleUpdateLink(formData);
    } else {
      // Pass the form data directly to handleAddLink
      handleAddLink(formData);
    }
  };

  return (
    // Removed dark mode classes, added light mode defaults
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg text-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Manage Social Links</h2>

      {isLoading && <p className="text-center text-gray-500">Loading links...</p>}
      {/* TODO: Add error display if needed */}

      {/* Add/Edit Form */}
      {(isAdding || editingLinkId) && (
        <SocialLinkForm
          key={editingLinkId || 'add-form'} // Add key to force re-render/reset state when switching between add/edit
          initialData={currentEditData}
          isEditing={!!editingLinkId}
          onSubmit={handleFormSubmit}
          onCancel={resetFormState}
        />
      )}

      {/* Add New Link Button */}
      {!isAdding && !editingLinkId && !isLoading && (
        <button // Adjusted button style for light background
          onClick={() => { setIsAdding(true); setEditingLinkId(null); setCurrentEditData(null); }}
          className="mb-6 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md"
        >
          <PlusCircle size={18} /> Add New Link
        </button>
      )}

      {/* Links List */}
      {!isLoading && links.length > 0 && (
        <div className="space-y-3">
          {/* Header Row - Adjusted for light theme */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-100 border-b border-gray-300 rounded-t-lg p-3 font-semibold text-gray-600 items-center sticky top-0 z-10">
            <div className="col-span-1 text-center">Order</div>
            <div className="col-span-1 text-center">Icon</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">URL</div>
            <div className="col-span-3 text-right pr-2">Actions</div>
          </div>

          {/* Link Items */}
          {links.map((link, index) => (
            <SocialLinkItem
              key={link.id}
              link={link}
              index={index}
              isFirst={index === 0}
              isLast={index === links.length - 1}
              onEdit={startEditing}
              onDelete={handleDeleteLink}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      {/* Empty State - Adjusted for light theme */}
      {!isLoading && links.length === 0 && !isAdding && (
         <div className="text-center text-gray-500 mt-6 p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
           <p className="font-medium">No social links found.</p>
           <p className="text-sm mt-1">Click "Add New Link" above to get started.</p>
         </div>
       )}
    </div>
  );
};

export default SocialLinksSection;
