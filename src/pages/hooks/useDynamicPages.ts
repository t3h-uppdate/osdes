import { useState, useEffect } from 'react';
import supabase from '../../config/supabaseConfig'; // Import Supabase client
import { Page } from '../../features/admin/sections/Pages/types'; // Ensure the Page type is imported

// Define Supabase table name
const PAGES_TABLE = 'pages';

export const useDynamicPages = () => {
  const [dynamicPages, setDynamicPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [errorPages, setErrorPages] = useState<Error | null>(null);

  useEffect(() => {
    setLoadingPages(true);
    setErrorPages(null);

    if (!supabase) {
      console.error("useDynamicPages: Supabase client not initialized correctly.");
      setErrorPages(new Error("Supabase client not initialized correctly."));
      setLoadingPages(false);
      return;
    }

    const fetchPages = async () => {
      // Add null check again for async scope
      if (!supabase) {
        console.error("useDynamicPages (fetch): Supabase client became null.");
        setErrorPages(new Error("Supabase client not initialized."));
        setLoadingPages(false);
        return;
      }
      try {
        // Fetch published pages from Supabase, ordered by creation date (newest first)
        const { data, error } = await supabase
          .from(PAGES_TABLE)
          .select('*') // Select all columns
          .eq('is_published', true) // Only fetch published pages
          .eq('is_original_page', false) // Only fetch blog pages (not original pages)
          .order('order', { ascending: true, nullsFirst: false }); // Order by manual order for public site

        if (error) throw error;

        // Map Supabase data to the Page interface
        // Ensure the mapping matches the Page type definition
        const pagesList = data?.map(item => ({
          id: String(item.id), // Assuming ID needs to be string
          slug: item.slug,
          title: item.title,
          content: item.content,
          is_published: item.is_published,
          order: item.order, // Ensure order is mapped if needed by Page type
          created_at: item.created_at, // Keep created_at if needed elsewhere
        } as Page)) || []; // Default to empty array

        setDynamicPages(pagesList);
        // console.log("useDynamicPages: Fetched dynamic pages from Supabase:", pagesList); // Optional log
      } catch (error: any) {
        console.error("useDynamicPages: Error fetching dynamic pages from Supabase:", error);
        setErrorPages(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
    // No cleanup needed for getDocs, but if using onSnapshot, add unsubscribe here.
  }, []); // Empty dependency array ensures this runs only once on mount

  return { dynamicPages, loadingPages, errorPages };
};
