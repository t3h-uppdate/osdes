import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import supabase from '../config/supabaseConfig';
// Import the hook to get translations and its types
import { useTranslations } from '../hooks/useTranslations';
// Import the SiteConfigData type (assuming it's correctly exported from useAdminData or a shared types file)
import { SiteConfigData } from '../features/admin/hooks/useAdminData';

// Define new table names and constants
const SITE_CONFIG_TABLE = 'site_config';
const SITE_CONFIG_ID = 1;
const THEME_STORAGE_KEY = 'themePreference'; // Key for localStorage
const DEFAULT_LANGUAGE = 'en'; // Or determine dynamically if needed

// Define the shape of the new context value
interface SiteContextValue {
  siteConfig: SiteConfigData | null; // Configuration data (e.g., logo_url)
  t: (key: string, defaultValue?: string) => string; // Translation function from useTranslations
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean; // Combined loading state
  error: string | null; // Combined error state
}

// Define default values for the new context shape
const defaultContextValue: SiteContextValue = {
  siteConfig: null,
  t: (key: string, defaultValue?: string) => defaultValue ?? key, // Basic fallback t function
  theme: 'light',
  toggleTheme: () => {},
  isLoading: true,
  error: null,
};

// Create the context with the new shape
const SiteContext = createContext<SiteContextValue>(defaultContextValue);

// Create the provider component
interface SiteProviderProps {
  children: ReactNode;
}

export const SiteProvider: React.FC<SiteProviderProps> = ({ children }) => {
  // State for site configuration
  const [siteConfig, setSiteConfig] = useState<SiteConfigData | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Use the translations hook
  // Assuming 'en' or a dynamically determined language
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations(DEFAULT_LANGUAGE);

  // State for theme (remains the same)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  // Fetch site configuration from Supabase
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingConfig(true);
      setConfigError(null);

      if (!supabase) {
        setConfigError("Supabase client not available.");
        setIsLoadingConfig(false);
        return;
      }

      try {
        const { data, error: dbError } = await supabase
          .from(SITE_CONFIG_TABLE)
          .select('*')
          .eq('id', SITE_CONFIG_ID)
          .maybeSingle(); // Use maybeSingle as config might not exist

        if (dbError) {
          // Don't treat "Not Found" as a critical error, just means no config saved yet
          if (dbError.code !== 'PGRST116') {
            throw dbError;
          }
          console.warn(`Site config (ID: ${SITE_CONFIG_ID}) not found. Using null.`);
          setSiteConfig(null); // Set to null if not found
        } else {
          setSiteConfig(data as SiteConfigData ?? null); // Set fetched data or null
        }
      } catch (err: any) {
        console.error("Error fetching site config:", err);
        setConfigError(`Failed to load site config: ${err.message || 'Unknown error'}`);
        setSiteConfig(null); // Set to null on error
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
    // Add Supabase real-time subscription for config if needed
  }, []); // Fetch config only once on mount

  // Theme persistence logic (remains the same)
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Theme toggle logic (remains the same)
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      return newTheme;
    });
  }, []);

  // Combine loading states
  const isLoading = isLoadingConfig || isLoadingTranslations;
  // Combine error states (prioritize config error for now)
  const error = configError || (translationsError ? translationsError.message : null);

  // Construct the context value with the new structure
  const value: SiteContextValue = {
    siteConfig,
    t, // Provide the translation function
    theme,
    toggleTheme,
    isLoading,
    error,
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};

// Custom hook to use the site context (renamed for clarity)
export const useSite = (): SiteContextValue => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
