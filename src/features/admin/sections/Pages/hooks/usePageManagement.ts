import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { Page } from '../types'; // Corrected path
import supabase from '../../../../../config/supabaseConfig'; // Import Supabase client
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path

// Define Supabase table name
const PAGES_TABLE = 'pages';

// Type for filtering
type PageFilter = 'all' | 'published' | 'draft';

// --- usePageManagement Hook ---
export const usePageManagement = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [pages, setPages] = useState<Page[]>([]); // Raw pages, ordered by 'order'
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // Keep track of the ID being edited
  const [filter, setFilter] = useState<PageFilter>('all');
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [itemsPerPage] = useState(10); // Items per page (could be made configurable)

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
        .select('*')
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
      } as Page)) || [];
      setPages(pagesList); // Set pages based on fetched order
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

  // Form data likely won't include id or order
  const handleFormSubmit = useCallback(async (formData: Omit<Page, 'id' | 'order'>) => {
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
        // Assign an initial order value (e.g., current timestamp or max order + 1)
        const newOrder = Date.now(); // Using timestamp for simplicity
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
    const pageTitle = pages.find(p => p.id === id)?.title || id;
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
  }, [supabase, pages, isEditing, showToast, requestConfirmation, fetchPages, resetForm]);

  const startEditing = useCallback((page: Page) => {
    if (!page.id) {
      showToast("Cannot edit page: Invalid ID.", 'error');
      return;
    }
    setIsEditing(page.id);
  }, [showToast]);

  // Removed sorting logic

  // --- Filtering Logic ---
  const filteredPages = useMemo(() => {
    if (filter === 'all') {
      return pages;
    }
    const targetStatus = filter === 'published';
    return pages.filter(page => (page.is_published ?? false) === targetStatus);
  }, [pages, filter]);

  // --- Pagination Logic ---
  const totalPages = useMemo(() => {
    return Math.ceil(filteredPages.length / itemsPerPage);
  }, [filteredPages.length, itemsPerPage]);

  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPages.slice(startIndex, endIndex);
  }, [filteredPages, currentPage, itemsPerPage]);

  const goToPage = useCallback((pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleFilterChange = useCallback((newFilter: PageFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);


  // --- Reordering Logic ---
  // Note: Reordering operates on the *raw* pages state before filtering/pagination
  // Note: Reordering operates on the *raw* pages state before filtering
  const updatePageOrder = useCallback(async (pageId: string, newOrder: number) => {
    if (!supabase) {
      showToast("Error: Supabase client is not initialized.", 'error');
      return { error: new Error("Supabase client not initialized.") };
    }
    return supabase.from(PAGES_TABLE).update({ order: newOrder }).eq('id', pageId);
  }, [supabase, showToast]); // Added showToast dependency

  const handleMove = useCallback(async (index: number, direction: 'up' | 'down') => {
    const pageToMove = pages[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= pages.length || !pageToMove?.id) {
      console.warn("Invalid move operation:", { index, direction, pageCount: pages.length });
      return; // Cannot move outside bounds or if page/ID is missing
    }

    const pageToSwapWith = pages[swapIndex];
    if (!pageToSwapWith?.id) {
        console.warn("Invalid move operation: Swap target missing ID", { swapIndex, pageToSwapWith });
        return; // Cannot swap if the target page ID is missing
    }

    // Use current order values, default to index if null/undefined
    const orderToMove = pageToMove.order ?? index;
    const orderToSwap = pageToSwapWith.order ?? swapIndex;

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
  }, [pages, updatePageOrder, showToast, fetchPages]); // Added dependencies

  const handleMoveUp = useCallback((index: number) => handleMove(index, 'up'), [handleMove]);
  const handleMoveDown = useCallback((index: number) => handleMove(index, 'down'), [handleMove]);


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
    const pageTitle = pages.find(p => p.id === id)?.title || id;

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
  }, [supabase, pages, showToast, fetchPages]);


  return {
    pages: paginatedPages, // Return paginated subset of filtered pages
    isLoading,
    isEditing,
    filter,
    currentPage, // Export pagination state
    totalPages, // Export pagination state
    // fetchPages, // Not needed externally
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleTogglePublish,
    handleMoveUp,
    handleMoveDown,
    handleFilterChange,
    goToPage, // Export pagination handlers
    goToNextPage, // Export pagination handlers
    goToPreviousPage, // Export pagination handlers
  };
};
