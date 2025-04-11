import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import supabase from '../config/supabaseConfig'; // Adjust path as needed
import { SiteSettingsData } from '../features/admin/hooks/useAdminData'; // Adjust path as needed

const SITE_SETTINGS_TABLE = 'site_settings';
const SITE_SETTINGS_ID = 1;
const THEME_STORAGE_KEY = 'themePreference'; // Key for localStorage

// Define the shape of the context value
interface SiteSettingsContextValue extends SiteSettingsData {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoadingSettings: boolean; // Renamed for clarity
  settingsError: string | null; // Renamed for clarity
}

// Define default values
const defaultContextValue: SiteSettingsContextValue = {
  id: SITE_SETTINGS_ID,
  site_title: 'Loading...',
  site_role: 'Loading...',
  // Add other fields with loading/default states
  theme: 'light', // Default theme
  toggleTheme: () => {}, // Placeholder function
  isLoadingSettings: true,
  settingsError: null,
};

// Create the context
const SiteSettingsContext = createContext<SiteSettingsContextValue>(defaultContextValue);

// Create the provider component
interface SiteSettingsProviderProps {
  children: ReactNode;
}

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultContextValue); // Use partial default
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize theme from localStorage or default to 'light'
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  // Fetch general site settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      // Reset state before fetching
      setIsLoadingSettings(true);
      setSettingsError(null);

      if (!supabase) {
        setSettingsError("Supabase client not available.");
        setIsLoadingSettings(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .select('*')
          .eq('id', SITE_SETTINGS_ID)
          .single(); // Fetch a single row

        if (dbError) {
          if (dbError.code === 'PGRST116') { // Code for "Not Found"
            console.warn(`Site settings (ID: ${SITE_SETTINGS_ID}) not found. Using defaults.`);
            // Keep the initial default settings
            setSettings(prev => ({ ...prev, ...defaultContextValue })); // Merge defaults just in case
          } else {
            throw dbError; // Re-throw other database errors
          }
        } else if (data) {
          // Merge fetched data with existing state (like theme)
          setSettings(prev => ({ ...prev, ...data as SiteSettingsData }));
        } else {
          console.warn(`No data returned for site settings (ID: ${SITE_SETTINGS_ID}). Using defaults.`);
          setSettings(prev => ({ ...prev, ...defaultContextValue }));
        }
      } catch (err: any) {
        console.error("Error fetching site settings:", err);
        setSettingsError(`Failed to load site settings: ${err.message || 'Unknown error'}`);
        // Keep defaults on error
        setSettings(prev => ({ ...prev, ...defaultContextValue }));
      } finally {
        setIsLoadingSettings(false);
      }
    //   .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: SITE_SETTINGS_TABLE, filter: `id=eq.${SITE_SETTINGS_ID}` }, payload => {
    //     console.log('Site settings updated!', payload);
    //     setSettings(payload.new as SiteSettingsData);
    //   })
    };

    fetchSettings();

    // Optional: Set up Supabase real-time subscription for settings if needed
    // ... (Supabase subscription code remains the same) ...

  }, []); // Fetch settings only once on mount

  // Effect to ONLY update localStorage when theme state changes
  useEffect(() => {
    // The inline script in index.html handles the initial class on page load.
    // The toggleTheme function handles class changes during interaction.
    // This effect's only job is to persist the React state to localStorage.
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]); // Re-run ONLY when the theme state changes

  // Function to toggle the theme state AND update the class directly
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Update the class on the HTML element directly when toggling
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark'); // Ensure only one class is present
      root.classList.add(newTheme);
      return newTheme; // Return the new state for setTheme
    });
  }, []);

  // Combine settings and theme logic into the context value
  const value: SiteSettingsContextValue = {
    ...settings,
    theme,
    toggleTheme,
    isLoadingSettings,
    settingsError,
  };

  // Provider component renders children wrapped in the context provider
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// Custom hook to use the site settings context
export const useSiteSettings = (): SiteSettingsContextValue => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
