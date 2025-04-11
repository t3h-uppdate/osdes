import { useState, useEffect } from 'react';
import supabase from '../config/supabaseConfig';
import { Page } from '../features/admin/sections/Pages/types';

const PAGES_TABLE = 'pages';

interface UseDynamicPageDataResult {
  page: Page | null;
  isLoading: boolean;
  error: string | null;
}

export function useDynamicPageData(slug: string | undefined): UseDynamicPageDataResult {
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when slug changes
    setPage(null);
    setIsLoading(true);
    setError(null);

    const fetchPage = async () => {
      if (!slug) {
        setError("No page identifier provided.");
        setIsLoading(false);
        return;
      }
      if (!supabase) {
        setError("Database connection not available.");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from(PAGES_TABLE)
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true) // Ensure only published pages are fetched
          .single(); // Expect only one page per slug

        if (dbError) {
          if (dbError.code === 'PGRST116') { // PostgREST code for "Not Found"
            setError(`The requested page ('${slug}') was not found or is not available.`);
            setPage(null);
          } else {
            console.error("Supabase error fetching page:", dbError);
            setError(`An error occurred while retrieving the page content.`);
            setPage(null);
            // Potentially throw dbError for higher-level error boundaries if needed
          }
        } else if (data) {
          setPage(data as Page);
        } else {
          // This case might be redundant due to .single() and PGRST116 handling
          setError(`The requested page ('${slug}') could not be found.`);
          setPage(null);
        }
      } catch (err: any) {
        console.error("Error fetching dynamic page:", err);
        setError(`An unexpected error occurred: ${err.message}`);
        setPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]); // Re-fetch if slug changes

  return { page, isLoading, error };
}
