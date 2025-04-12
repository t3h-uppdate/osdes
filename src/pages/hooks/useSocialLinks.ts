import { useState, useEffect } from 'react';
import supabase from '../../config/supabaseConfig'; // Import Supabase client
// Icons are now handled by IconRenderer, remove direct imports here

// Define the SocialLink interface (adjust if needed, mapping platform to name/icon)
export interface SocialLink {
  id: string; // Assuming Supabase ID is compatible (number or string)
  name: string; // Will be mapped from 'platform'
  url: string;
  icon: string; // Will be mapped from 'platform'
  order: number; // Will be mapped from 'sort_order'
}

// Define Supabase table name
const SOCIAL_LINKS_TABLE = 'social_links';

// Remove the icon components map, it's handled by IconRenderer now

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!supabase) {
        console.error("useSocialLinks: Supabase client is not available.");
        setError(new Error("Supabase client not available"));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from Supabase 'social_links' table, order by 'sort_order'
        const { data, error: supabaseError } = await supabase
          .from(SOCIAL_LINKS_TABLE)
          .select('*') // Select all columns
          .order('sort_order', { ascending: true }); // Use Supabase ordering

        if (supabaseError) {
          throw supabaseError;
        }

        // Map Supabase data to the SocialLink interface
        const links = data?.map(item => ({
          id: String(item.id), // Ensure ID is a string if needed
          name: item.platform, // Map platform to name
          url: item.url,
          icon: item.platform, // Map platform to icon key
          order: item.sort_order // Map sort_order to order
        })) || []; // Default to empty array if data is null

        setSocialLinks(links);
        // console.log("useSocialLinks: Fetched social links from Supabase:", links); // Optional log
      } catch (err: any) {
        console.error("useSocialLinks: Error fetching social links from Supabase:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialLinks();
    // No cleanup needed for getDocs, but good practice if using onSnapshot
  }, []); // Runs once on mount

  // Return only the data, loading state, and error
  return { socialLinks, isLoading, error };
}
