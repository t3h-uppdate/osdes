import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { Page } from '../types'; // Corrected path
import supabase from '../../../../../config/supabaseConfig'; // Import Supabase client
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path

// Define Supabase table name
const PAGES_TABLE = 'pages';

// --- usePageManagement Hook ---
// This hook now focuses on fetching all pages and providing CRUD/reordering logic.
// Filtering and pagination will be handled in the component.
export const usePageManagement = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [allPages, setAllPages] = useState<Page[]>([]); // Store all fetched pages
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // Keep track of the ID being edited

  const fetchPages = useCallback(async () => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Fetch pages ordered by the 'order' column for manual sorting
      const { data, error } = await supabase
        .from(PAGES_TABLE)
        .select('*, is_original_page') // Ensure is_original_page is selected
        .order('order', { ascending: true, nullsFirst: false }); // Order by manual order, nulls last

      if (error) throw error;

      // Map Supabase data to the Page interface
      const pagesList = data?.map(item => ({
        id: String(item.id),
        slug: item.slug,
        title: item.title,
        content: item.content,
        is_published: item.is_published,
        created_at: item.created_at,
        updated_at: item.updated_at, // Map updated_at
        order: item.order, // Map the order field
        is_original_page: item.is_original_page, // Map the new field
      } as Page)) || [];
      setAllPages(pagesList); // Set all pages based on fetched order
    } catch (err: any) {
      console.error("Error fetching pages from Supabase:", err);
      showToast('Failed to load pages. Check console for details.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]); // supabase is stable

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const resetForm = useCallback(() => {
    setIsEditing(null);
  }, []);

  // Form data likely won't include id or order, but should include is_original_page
  const handleFormSubmit = useCallback(async (formData: Omit<Page, 'id' | 'order' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      setIsLoading(false);
      return;
    }

    // Prepare data for Supabase (order is omitted)
    // Ensure is_published is included, default to false if not provided by form
    const pageData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        is_published: formData.is_published ?? false, // Default to false if not set
        is_original_page: formData.is_original_page ?? false, // Default to false if not set
    };

    try {
      if (isEditing) {
        // Update existing page
        const { error } = await supabase
          .from(PAGES_TABLE)
          .update(pageData)
          .eq('id', isEditing);
        if (error) throw error;
        showToast('Page updated successfully!', 'success');
      } else {
      // Insert new page
      // Calculate the next order number based on existing pages
      const maxOrder = allPages.reduce((max, p) => Math.max(max, p.order ?? 0), 0); // Use allPages
      const newOrder = maxOrder + 1;
      const dataToInsert = { ...pageData, order: newOrder };

        const { error } = await supabase
          .from(PAGES_TABLE)
          .insert(dataToInsert);
        if (error) throw error;
        showToast('Page added successfully!', 'success');
      }
      resetForm();
      fetchPages(); // Refetch after successful save
    } catch (err: any) {
      console.error("Error saving page to Supabase:", err);
      showToast('Failed to save page. Check console for details.', 'error');
    } finally {
      // fetchPages sets loading to false, so no need here unless error occurs before fetchPages call
      setIsLoading(false);
    }
  }, [supabase, isEditing, showToast, fetchPages, resetForm]); // Removed pages dependency

  const handleDelete = useCallback((id: string) => {
    if (!id) {
        showToast("Cannot delete page: Invalid ID.", 'error');
        return;
    }
    const pageTitle = allPages.find(p => p.id === id)?.title || id; // Use allPages
    requestConfirmation({
      message: `Are you sure you want to delete the page "${pageTitle}"?\nThis action cannot be undone.`,
      onConfirm: async () => {
        if (!supabase) {
          showToast("Error: Supabase client is not initialized.", 'error');
          return;
        }
        setIsLoading(true); // Indicate loading during delete
        try {
          const { error } = await supabase
            .from(PAGES_TABLE)
            .delete()
            .eq('id', id);

          if (error) throw error;

          showToast('Page deleted successfully!', 'success');
          if (isEditing === id) {
            resetForm(); // Reset form if the deleted page was being edited
          }
          fetchPages(); // Refetch pages list
        } catch (err: any) {
          console.error("Error deleting page from Supabase:", err);
          showToast('Failed to delete page. Check console for details.', 'error');
          setIsLoading(false); // Ensure loading stops on error
        }
        // fetchPages will set loading to false on success/failure
      },
      confirmText: 'Delete Page',
      title: 'Confirm Deletion'
    });
  }, [supabase, allPages, isEditing, showToast, requestConfirmation, fetchPages, resetForm]); // Use allPages

  const startEditing = useCallback((page: Page) => {
    if (!page.id) {
      showToast("Cannot edit page: Invalid ID.", 'error');
      return;
    }
    setIsEditing(page.id);
  }, [showToast]);

  // Removed sorting, filtering, and pagination logic - will be handled in component


  // --- Reordering Logic ---
  // Operates on the full list (allPages) and updates DB order directly
  const updatePageOrder = useCallback(async (pageId: string, newOrder: number) => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      return { error: new Error("Supabase client not initialized.") };
    }
    return supabase.from(PAGES_TABLE).update({ order: newOrder }).eq('id', pageId);
  }, [supabase, showToast]); // Added showToast dependency

  const handleMove = useCallback(async (pageId: string, direction: 'up' | 'down') => {
    // Find the actual index in the full 'allPages' array
    const index = allPages.findIndex(p => p.id === pageId); // Use allPages
    if (index === -1) {
      console.error("Cannot move page: ID not found in the full list.", { pageId }); // Updated error message
      showToast("Error: Could not find the page to move.", 'error');
      return;
    }

    const pageToMove = allPages[index]; // Use allPages
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Check bounds using the full allPages array length
    if (swapIndex < 0 || swapIndex >= allPages.length) { // Use allPages.length
      console.warn("Invalid move operation: Out of bounds.", { index, direction, pageCount: allPages.length }); // Use allPages.length
      return; // Cannot move outside bounds
    }

    const pageToSwapWith = allPages[swapIndex]; // Use allPages

    // Ensure both pages and their orders are valid before proceeding
    if (!pageToMove?.id || pageToMove.order === undefined || pageToMove.order === null ||
        !pageToSwapWith?.id || pageToSwapWith.order === undefined || pageToSwapWith.order === null) {
      console.error("Invalid move operation: Missing ID or order value.", { pageToMove, pageToSwapWith });
      showToast("Error: Cannot move page due to missing data.", 'error');
      return;
    }

    const orderToMove = pageToMove.order;
    const orderToSwap = pageToSwapWith.order;

    setIsLoading(true);
    try {
      // Perform updates in parallel
      const { error: errorMove } = await updatePageOrder(pageToMove.id, orderToSwap);
      if (errorMove) throw new Error(`Failed to update order for ${pageToMove.title}: ${errorMove.message}`);

      const { error: errorSwap } = await updatePageOrder(pageToSwapWith.id, orderToMove);
       if (errorSwap) {
         // Attempt to revert the first update if the second fails
         console.warn(`Failed to update order for ${pageToSwapWith.title}, attempting revert...`);
         await updatePageOrder(pageToMove.id, orderToMove); // Revert
         throw new Error(`Failed to update order for ${pageToSwapWith.title}: ${errorSwap.message}`);
       }

      showToast('Page order updated successfully!', 'success');
      fetchPages(); // Refetch to show the new order
    } catch (err: any) {
      console.error("Error updating page order:", err);
      showToast(err.message || 'Failed to update page order. Check console.', 'error');
      setIsLoading(false); // Ensure loading stops on error
    }
    // fetchPages sets loading to false on success
  }, [allPages, updatePageOrder, showToast, fetchPages]); // Use allPages

  // Update handlers to accept pageId
  const handleMoveUp = useCallback((pageId: string) => handleMove(pageId, 'up'), [handleMove]);
  const handleMoveDown = useCallback((pageId: string) => handleMove(pageId, 'down'), [handleMove]);


  // --- Toggle Publish Status ---
  const handleTogglePublish = useCallback(async (id: string, currentState: boolean) => {
    if (!id) {
      showToast("Cannot toggle publish status: Invalid ID.", 'error');
      return;
    }
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      return;
    }

    const newState = !currentState;
    const actionText = newState ? 'Publishing' : 'Unpublishing';
    const pageTitle = allPages.find(p => p.id === id)?.title || id; // Use allPages

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from(PAGES_TABLE)
        .update({ is_published: newState })
        .eq('id', id);

      if (error) throw error;

      showToast(`Page "${pageTitle}" ${newState ? 'published' : 'unpublished'} successfully!`, 'success');
      fetchPages(); // Refetch to update the list UI
    } catch (err: any) {
      console.error(`Error ${actionText.toLowerCase()} page:`, err);
      showToast(`Failed to ${actionText.toLowerCase()} page. Check console.`, 'error');
      setIsLoading(false); // Ensure loading stops on error
    }
    // fetchPages will set loading to false on success/failure
  }, [supabase, allPages, showToast, fetchPages]); // Use allPages


  return {
    allPages, // Return the raw list of all pages
    isLoading,
    isEditing,
    // Removed filter, currentPage, totalPages, paginatedPages, filter/pagination handlers
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleTogglePublish,
    handleMoveUp,
    handleMoveDown,
    // fetchPages, // Not typically needed externally if useEffect runs it
  };
};
