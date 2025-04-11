import { useState, useEffect, useCallback } from 'react';
import { Page } from '../types'; // Corrected path
import supabase from '../../../../../config/supabaseConfig'; // Import Supabase client
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path

// Define Supabase table name
const PAGES_TABLE = 'pages';

// --- usePageManagement Hook ---
export const usePageManagement = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [pages, setPages] = useState<Page[]>([]);
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
      // Fetch pages ordered by creation date (newest first) for admin view
      const { data, error } = await supabase
        .from(PAGES_TABLE)
        .select('*')
        .order('created_at', { ascending: false }); // Admin might want newest first

      if (error) throw error;

      // Map Supabase data to the Page interface
      const pagesList = data?.map(item => ({
        id: String(item.id),
        slug: item.slug,
        title: item.title,
        content: item.content,
        is_published: item.is_published,
        // order is now optional and not fetched/used for ordering here
      } as Page)) || [];
      setPages(pagesList);
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
        // Insert new page (Supabase handles created_at)
        const { error } = await supabase
          .from(PAGES_TABLE)
          .insert(pageData);
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

  // Remove handleMove, handleMoveUp, handleMoveDown as ordering is based on created_at

  return {
    pages,
    isLoading,
    isEditing,
    // fetchPages, // Not needed externally
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    // Removed handleMoveUp, handleMoveDown
  };
};
