import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../config/supabaseConfig';
import { useNotifications } from '../../../contexts/NotificationContext';

// Define new table names and constants
const SITE_CONFIG_TABLE = 'site_config';
const TRANSLATIONS_TABLE = 'translations';
const SITE_CONFIG_ID = 1; // ID for the single config row
const DEFAULT_LANGUAGE = 'en'; // Assuming 'en' is the primary language for admin

// Define type for the site config data structure
export interface SiteConfigData {
  id?: number; // Should always be 1
  logo_url?: string | null;
  logo_icon_name?: string | null; // New field for the icon name
  nav_links?: { text: string; url: string }[] | null; // Added for navigation links
  footer_links?: { text: string; url: string }[] | null; // Added for footer links
  footer_links_title?: string | null; // New field for the footer links title
  blogTitle?: string | null; // Add the blog title field
  projects_section_title?: string | null; // Title for the projects section
  services_section_title?: string | null; // Title for the services section
  services_section_subtitle?: string | null; // Subtitle for the services section
  // Add other non-translatable config fields here if any (e.g., theme)
  updated_at?: string;
}

// Define default values for site config
const defaultSiteConfig: SiteConfigData = {
  id: SITE_CONFIG_ID,
  logo_url: "",
  logo_icon_name: null, // Default to null
  nav_links: [], // Default to empty array
  footer_links: [], // Default to empty array
  footer_links_title: 'Quick Links', // Default title
  blogTitle: 'Our Blog', // Default blog title
  projects_section_title: 'Projects', // Default projects title
  services_section_title: 'Our Services', // Default services title
  services_section_subtitle: 'Everything you need', // Default services subtitle
};

// Define type for the translations data structure (key-value pairs)
export type TranslationsData = Record<string, string>;

export const useAdminData = () => {
  // State for site config (site_config table)
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>(defaultSiteConfig);
  // State for translations (translations table, key-value pairs)
  const [translationsData, setTranslationsData] = useState<TranslationsData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const { showToast } = useNotifications();

  // Effect to fetch data from Supabase on mount
  useEffect(() => {
    if (!supabase) {
      console.error("useAdminData: Supabase client is not available.");
      setSaveStatus("Error: Supabase connection failed.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setSaveStatus(''); // Clear previous status
      let configData: SiteConfigData | null = null;
      let fetchedTranslations: TranslationsData = {};
      let fetchError = null;

      try {
        // Add null check here again to satisfy TypeScript within this scope
        if (!supabase) {
            console.error("useAdminData (fetchData): Supabase client is not available.");
            throw new Error("Supabase client not available");
        }

        // Fetch site_config
        const { data: configResult, error: configError } = await supabase
          .from(SITE_CONFIG_TABLE)
          .select('*, nav_links, footer_links') // Select new JSON columns
          .eq('id', SITE_CONFIG_ID)
          .maybeSingle(); // Use maybeSingle as the row might not exist initially

        if (configError) {
          fetchError = configError; // Store error but continue
          console.error(`Error fetching site config from Supabase:`, configError);
        } else {
          configData = configResult as SiteConfigData ?? null;
        }

        // Fetch translations for the default language
        const { data: translationsResult, error: translationsError } = await supabase
          .from(TRANSLATIONS_TABLE)
          .select('key, value')
          .eq('language', DEFAULT_LANGUAGE);

        if (translationsError) {
          fetchError = translationsError; // Store error
          console.error(`Error fetching translations from Supabase for ${DEFAULT_LANGUAGE}:`, translationsError);
        } else if (translationsResult) {
          // Transform the array of {key, value} into a Record<string, string>
          fetchedTranslations = translationsResult.reduce((acc, item) => {
            if (item.key) { // Ensure key is not null/undefined
              acc[item.key] = item.value ?? ''; // Use empty string for null values
            }
            return acc;
          }, {} as TranslationsData);
        }

        // Handle results after both fetches attempt
        if (fetchError) {
          setSaveStatus("Error fetching data from Supabase.");
          // Fallback to defaults on any critical error
          setSiteConfig(defaultSiteConfig);
          setTranslationsData({}); // Fallback to empty object for translations
        } else {
          // Set site config state (handle missing config row)
          if (configData) {
            setSiteConfig(configData);
          } else {
            console.log(`No site config found in Supabase (ID: ${SITE_CONFIG_ID}), using defaults.`);
            setSiteConfig(defaultSiteConfig);
            // Optionally trigger save of default config here if needed
            // await saveSiteConfig({ useDefaults: true });
          }

          // Set translations state
          setTranslationsData(fetchedTranslations);
          if (Object.keys(fetchedTranslations).length === 0) {
             console.log(`No translations found in Supabase for language '${DEFAULT_LANGUAGE}'.`);
          }
        }

      } catch (err: any) { // Catch any unexpected errors during the process
        console.error(`Unexpected error during data fetch:`, err);
        setSaveStatus("Error fetching data from Supabase.");
        setSiteConfig(defaultSiteConfig);
        setTranslationsData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // No cleanup needed for one-time fetch. Add Supabase Realtime subscription here if needed later.
  }, []); // Empty dependency array ensures this runs only on mount

  // --- Input Handlers ---

  // Handler for simple site config changes (strings, nulls)
  // Updated Omit to include the new footer_links_title
  const handleSiteConfigChange = useCallback((key: keyof Omit<SiteConfigData, 'id' | 'updated_at' | 'nav_links' | 'footer_links' | 'footer_links_title'>, value: string | null | undefined) => {
    setSiteConfig(prev => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus(''); // Clear status on input change
  }, []);

  // Generic handler for input changes (covers text, textarea, select)
  // This can handle footer_links_title and other simple string fields
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setSiteConfig(prev => ({
      ...prev,
      [name]: value,
    }));
    setSaveStatus(''); // Clear status on input change
  }, []);


  // Specific handler for updating link arrays (replaces the whole array)
  const handleLinkListChange = useCallback((key: 'nav_links' | 'footer_links', links: { text: string; url: string }[]) => {
    setSiteConfig(prev => ({
      ...prev,
      [key]: links,
    }));
    setSaveStatus(''); // Clear status on input change
  }, []);

  // Handler for individual translation changes
  const handleTranslationChange = useCallback((key: string, value: string) => {
    setTranslationsData(prev => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus(''); // Clear status on input change
  }, []);


  // --- Save Functions ---

  // Save function for site_config
  const saveSiteConfig = async (options?: { dataToSave?: SiteConfigData, useDefaults?: boolean }) => {
    const configToSave = options?.dataToSave
                         ? options.dataToSave
                         : options?.useDefaults
                           ? defaultSiteConfig
                           : siteConfig;

    // Ensure the ID is always correct before saving
    const finalConfig = { ...configToSave, id: SITE_CONFIG_ID };
    // Remove updated_at before sending, DB handles it
    delete finalConfig.updated_at;

    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    setSaveStatus('Saving site config...');
    try {
      const { error } = await supabase
        .from(SITE_CONFIG_TABLE)
        .upsert(finalConfig, { onConflict: 'id' }); // Specify conflict target

      if (error) throw error;

      // Optionally refetch config to get new updated_at or assume success
      showToast('Site config saved successfully!', 'success');
      setSaveStatus('');
    } catch (error: any) {
      console.error("Failed to save site config to Supabase:", error);
      showToast(`Error saving site config: ${error.message}`, 'error');
      setSaveStatus('');
    }
  };

  // Save function for a single translation key-value pair
  const saveTranslation = async (key: string, value: string) => {
    if (!key) {
        showToast('Error: Translation key cannot be empty.', 'error');
        return;
    }

    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    setSaveStatus(`Saving translation for "${key}"...`);
    try {
      const { error } = await supabase
        .from(TRANSLATIONS_TABLE)
        .upsert(
            { key: key, value: value, language: DEFAULT_LANGUAGE },
            { onConflict: 'key, language' } // Specify conflict target columns
        );

      if (error) throw error;

      showToast(`Translation for "${key}" saved successfully!`, 'success');
      setSaveStatus(''); // Clear status on successful save
    } catch (error: any) {
      console.error(`Failed to save translation for "${key}" to Supabase:`, error);
      showToast(`Error saving translation for "${key}": ${error.message}`, 'error');
      setSaveStatus(''); // Clear status on error
    }
  };

  // Consider adding a bulk save function for translations if needed:
  // const saveAllTranslations = async () => { ... }


  // --- Reset Functions ---
  // Resetting translations might require fetching/defining defaults again.
  // For now, only implementing config reset.

  // Reset function specifically for site_config
  const resetSiteConfigToDefaults = useCallback(async () => {
    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    if (window.confirm('Are you sure you want to reset Site Configuration (Logo URL, etc.) to default values? This cannot be undone.')) {
      setSaveStatus('Resetting site config...');
      try {
        // Use the predefined defaults
        const configToSave = { ...defaultSiteConfig };
        delete configToSave.updated_at; // Don't send updated_at

        const { error } = await supabase
          .from(SITE_CONFIG_TABLE)
          .upsert(configToSave, { onConflict: 'id' }); // Upsert the default config

        if (error) throw error;

        // Optimistically update local state
        setSiteConfig(defaultSiteConfig);
        showToast('Site config reset to defaults.', 'success');
        setSaveStatus('');
      } catch (error: any) {
        console.error("Failed to reset site config in Supabase:", error);
        showToast(`Error resetting site config: ${error.message}`, 'error');
        setSaveStatus('');
      }
    }
  }, [showToast]); // Dependencies: showToast


  // --- Return Value ---
  return {
    siteConfig,
    translationsData,
    isLoading,
    saveStatus,
    setSaveStatus,
    setSiteConfig, // Expose setter for direct manipulation if needed
    setTranslationsData, // Expose setter for direct manipulation if needed
    handleSiteConfigChange, // Keep for specific non-input changes if needed later
    handleInputChange, // Add the generic input handler
    handleLinkListChange,
    handleTranslationChange,
    saveSiteConfig,
    saveTranslation,
    // saveAllTranslations, // Add if implemented
    resetSiteConfigToDefaults,
    // handleDeleteItem removed as it wasn't implemented for settings/content
  };
};
