import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import supabase from '../config/supabaseConfig'; // Adjust path as needed
// Import the SiteSettingsData type (assuming it's exported from useAdminData or a shared types file)
import { SiteSettingsData } from '../features/admin/hooks/useAdminData'; // Adjust path as needed

const SITE_SETTINGS_TABLE = 'site_settings';
const SITE_SETTINGS_ID = 1;

// Define default values (can be simpler than the admin hook's defaults)
const defaultSettings: SiteSettingsData = {
  id: SITE_SETTINGS_ID,
  site_title: 'Loading...',
  site_role: 'Loading...',
  // Add other fields with loading/default states
};

// Create the context
const SiteSettingsContext = createContext<SiteSettingsData>(defaultSettings);

// Create the provider component
interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) {
        setError("Supabase client not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .select('*')
          .eq('id', SITE_SETTINGS_ID)
          .single();

        if (dbError) {
          // Handle case where the row might not exist yet
          if (dbError.code === 'PGRST116') {
            console.warn(`Site settings not found in database (ID: ${SITE_SETTINGS_ID}). Using defaults.`);
            // Keep defaultSettings or potentially set specific defaults for frontend
            setSettings(defaultSettings); // Or a more specific frontend default set
          } else {
            throw dbError; // Throw other Supabase errors
          }
        } else if (data) {
          setSettings(data as SiteSettingsData);
        } else {
           console.warn(`Received null data for site settings (ID: ${SITE_SETTINGS_ID}). Using defaults.`);
           setSettings(defaultSettings);
        }
      } catch (err: any) {
        console.error("Error fetching site settings:", err);
        setError("Failed to load site settings.");
        // Optionally keep defaults or set error state in settings object
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();

    // Optional: Set up Supabase real-time subscription if needed
    // const channel = supabase.channel('site_settings_changes')
    //   .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: SITE_SETTINGS_TABLE, filter: `id=eq.${SITE_SETTINGS_ID}` }, payload => {
    //     console.log('Site settings updated!', payload);
    //     setSettings(payload.new as SiteSettingsData);
    //   })
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };

  }, []); // Empty dependency array ensures this runs only on mount

  // Provide settings, loading state, and error state
  // You might only need to provide `settings` depending on usage
  const value = settings; // Directly provide the settings object

  // Optional: Show loading indicator or children directly
  // if (isLoading) {
  //   return <div>Loading site settings...</div>; // Or a spinner component
  // }
  // if (error) {
  //   return <div>Error loading site settings: {error}</div>;
  // }

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// Custom hook to use the site settings context
export const useSiteSettings = () => {
  return useContext(SiteSettingsContext);
};
