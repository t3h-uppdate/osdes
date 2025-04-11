import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../config/supabaseConfig'; // Import Supabase client
import { translations as defaultTranslations } from '../../../config/translations'; // Adjust path as needed
import { useNotifications } from '../../../contexts/NotificationContext'; // Import the hook
// Updated imports for moved types and constants
import { TranslationsType, LanguageKey } from '../../../types/translations'; // Moved global types
// newProjectTemplate import removed as projects are now in a separate table/hook
// ServiceItem import removed as services are now in a separate table/hook
import { updateNestedState } from '../utils/helpers'; // Moved helper function

// Define Supabase tables and language key
const SITE_CONTENT_TABLE = 'site_content';
const SITE_SETTINGS_TABLE = 'site_settings'; // New table name
const SITE_SETTINGS_ID = 1; // ID for the single settings row
const TARGET_LANGUAGE: LanguageKey = 'en';

// Define and EXPORT a type for the site settings data structure (matching the table)
export interface SiteSettingsData { // Added export
  id?: number; // Should always be 1
  site_title?: string | null;
  site_role?: string | null;
  logo_url?: string | null;
  hero_title?: string | null;
  hero_title2?: string | null;
  hero_subtitle?: string | null;
  hero_cta_button_text?: string | null;
  about_description?: string | null;
  footer_copyright?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  contact_mail?: string | null;
  updated_at?: string;
}

// Define default values for site settings (used for initialization and reset)
const defaultSiteSettings: SiteSettingsData = {
  id: SITE_SETTINGS_ID,
  site_title: "Default Site Title",
  site_role: "Default Role",
  logo_url: "",
  hero_title: "Default Hero Title",
  hero_title2: "",
  hero_subtitle: "Default hero subtitle.",
  hero_cta_button_text: "Get Started",
  about_description: "Default about description.",
  footer_copyright: `© ${new Date().getFullYear()} Default Copyright`,
  contact_phone: "",
  contact_address: "",
  contact_mail: "",
};


export const useAdminData = () => {
  // State for existing translations (site_content table)
  const [translations, setTranslations] = useState<TranslationsType>(defaultTranslations);
  // State for new site settings (site_settings table)
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // Combined save status for now
  const { showToast } = useNotifications();

  // Effect to fetch data from Supabase on mount
  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client is not available.");
      setSaveStatus("Error: Supabase connection failed.");
      setIsLoading(false);
      return;
    }

    const fetchSiteContent = async () => {
      // Add null check here again to satisfy TypeScript within this scope
      if (!supabase) {
          console.error("useAdminData (fetch): Supabase client is not available.");
          // Error state is already set outside, just return
          setIsLoading(false); // Ensure loading stops
          return;
      }
      setIsLoading(true);
      let contentData: TranslationsType['en'] | null = null;
      let settingsData: SiteSettingsData | null = null;
      let fetchError = null;

      try {
        // Fetch site_content (existing translations)
        const { data: contentResult, error: contentError } = await supabase
          .from(SITE_CONTENT_TABLE)
          .select('content')
          .eq('language', TARGET_LANGUAGE)
          .single();

        if (contentError && contentError.code !== 'PGRST116') {
          fetchError = contentError; // Store error but continue to fetch settings
          console.error(`Error fetching site content from Supabase for ${TARGET_LANGUAGE}:`, contentError);
        } else {
          contentData = contentResult?.content as TranslationsType['en'] ?? null;
        }

        // Fetch site_settings
        const { data: settingsResult, error: settingsError } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .select('*')
          .eq('id', SITE_SETTINGS_ID)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          fetchError = settingsError; // Store error
          console.error(`Error fetching site settings from Supabase:`, settingsError);
        } else {
          settingsData = settingsResult as SiteSettingsData ?? null;
        }

        // Handle results after both fetches attempt
        if (fetchError) {
          setSaveStatus("Error fetching data from Supabase.");
          // Fallback to defaults for both states on any critical error
          setTranslations(defaultTranslations);
          setSiteSettings(defaultSiteSettings);
        } else {
          // Set translations state (handle missing content)
          if (contentData) {
            setTranslations(prev => ({ ...prev, [TARGET_LANGUAGE]: contentData! }));
          } else {
            console.log(`No site content found in Supabase for language '${TARGET_LANGUAGE}', using defaults.`);
            setTranslations(defaultTranslations);
            // Optionally trigger save of defaults here if needed
          }

          // Set site settings state (handle missing settings row)
          if (settingsData) {
            setSiteSettings(settingsData);
          } else {
            console.log(`No site settings found in Supabase (ID: ${SITE_SETTINGS_ID}), using defaults.`);
            setSiteSettings(defaultSiteSettings);
            // Optionally trigger save of default settings here if needed
            // await saveSiteSettings({ useDefaults: true });
          }
        }

      } catch (err: any) { // Catch any unexpected errors during the process
        console.error(`Unexpected error during data fetch:`, err);
        setSaveStatus("Error fetching data from Supabase.");
        setTranslations(defaultTranslations);
        setSiteSettings(defaultSiteSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteContent();
    // No cleanup needed for one-time fetch. Add Supabase Realtime subscription here if needed later.
  }, []); // Empty dependency array ensures this runs only on mount

  // --- Input Handlers ---

  // Existing handler for nested translations object (site_content)
  const handleTranslationsChange = useCallback((fullPath: (string | number)[], value: string | string[]) => {
    setTranslations((prev: TranslationsType) => {
      const langToUpdate: LanguageKey = TARGET_LANGUAGE;
      if (!fullPath || fullPath.length === 0) return prev;
      const updatedLangData = updateNestedState(prev[langToUpdate], fullPath, value);
      return { ...prev, [langToUpdate]: updatedLangData };
    });
    setSaveStatus('');
  }, []);

  // New handler for flat site settings object
  const handleSiteSettingChange = useCallback((key: keyof SiteSettingsData, value: string) => {
    // Ensure 'id' and 'updated_at' are not directly modified by this handler
    if (key === 'id' || key === 'updated_at') return;

    setSiteSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus(''); // Clear status on input change
  }, []);


  // --- Save Functions ---

  // Existing save function for site_content (translations)
  const saveTranslations = async (options?: { dataToSave?: TranslationsType['en'], useDefaults?: boolean }) => {
    const dataToSave = options?.dataToSave
                     ? options.dataToSave
                     : options?.useDefaults
                       ? defaultTranslations[TARGET_LANGUAGE]
                       : translations[TARGET_LANGUAGE];

    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    setSaveStatus('Saving translations...');
    try {
      const { error } = await supabase
        .from(SITE_CONTENT_TABLE)
        .upsert({ language: TARGET_LANGUAGE, content: dataToSave });

      if (error) throw error;

      showToast('Translation content saved successfully!', 'success');
      setSaveStatus('');
    } catch (error) {
      console.error("Failed to save site content to Supabase:", error);
      showToast('Error saving translation content.', 'error');
      setSaveStatus('');
    }
  };

  // New save function for site_settings
  const saveSiteSettings = async (options?: { dataToSave?: SiteSettingsData, useDefaults?: boolean }) => {
    const settingsToSave = options?.dataToSave
                         ? options.dataToSave
                         : options?.useDefaults
                           ? defaultSiteSettings
                           : siteSettings;

    // Ensure the ID is always correct before saving
    const finalSettings = { ...settingsToSave, id: SITE_SETTINGS_ID };
    // Remove updated_at before sending, DB handles it
    delete finalSettings.updated_at;


    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    setSaveStatus('Saving site settings...');
    try {
      const { error } = await supabase
        .from(SITE_SETTINGS_TABLE)
        .upsert(finalSettings); // Upsert the single settings row

      if (error) throw error;

      // Optimistically update local state with potentially new updated_at from DB (or refetch)
      // For simplicity, we'll just show success for now. Refetching might be better.
      // const { data: updatedData } = await supabase.from(SITE_SETTINGS_TABLE).select('updated_at').eq('id', SITE_SETTINGS_ID).single();
      // if (updatedData) setSiteSettings(prev => ({ ...prev, updated_at: updatedData.updated_at }));

      showToast('Site settings saved successfully!', 'success');
      setSaveStatus('');
    } catch (error) {
      console.error("Failed to save site settings to Supabase:", error);
      showToast('Error saving site settings.', 'error');
      setSaveStatus('');
    }
  };


  // --- Deletion and Reset ---

  // handleDeleteItem remains largely unchanged for now, as it didn't handle general info fields
  const handleDeleteItem = useCallback(async (pathToDelete: (string | number)[]) => {
    // ... (keep existing deletion logic if it handles things other than general info)
    // For now, this function likely does nothing relevant to site_settings
    console.warn("handleDeleteItem called, but no specific logic for site_settings implemented yet.", pathToDelete);
    // Ensure dependencies are correct if logic is added later
  }, [showToast]); // Add other dependencies like saveTranslations if needed


  // Reset function specifically for site_settings
  const resetSiteSettingsToDefaults = useCallback(async () => {
    if (!supabase) {
      setSaveStatus("Error: Supabase connection failed.");
      showToast("Error: Supabase connection failed.", 'error');
      return;
    }
    if (window.confirm('Are you sure you want to reset Site Settings (Title, Hero, About, Footer, Contact Info) to their default values? This cannot be undone.')) {
      setSaveStatus('Resetting site settings...');
      try {
        // Use the predefined defaults
        const settingsToSave = { ...defaultSiteSettings };
        delete settingsToSave.updated_at; // Don't send updated_at

        const { error } = await supabase
          .from(SITE_SETTINGS_TABLE)
          .upsert(settingsToSave); // Upsert the default settings

        if (error) throw error;

        // Optimistically update local state
        setSiteSettings(defaultSiteSettings);
        showToast('Site settings reset to defaults.', 'success');
        setSaveStatus('');
      } catch (error) {
        console.error("Failed to reset site settings in Supabase:", error);
        showToast('Error resetting site settings.', 'error');
        setSaveStatus('');
      }
    }
  }, [showToast]); // Dependencies: showToast, setSiteSettings, setSaveStatus

  // Existing reset function, now only for site_content (if needed)
  const resetTranslationsToDefaults = useCallback(async () => {
     if (!supabase) {
       setSaveStatus("Error: Supabase connection failed.");
       showToast("Error: Supabase connection failed.", 'error');
       return;
     }
     // Adjust confirmation message if only specific parts of translations remain
     if (window.confirm('Are you sure you want to reset remaining text content (e.g., Contact Form Labels) to default values?')) {
       setSaveStatus('Resetting translations...');
       // Create a default object *excluding* the fields now in site_settings
       const defaultContent = { ...defaultTranslations[TARGET_LANGUAGE] };
       // Explicitly remove fields moved to site_settings
       delete (defaultContent as any).generalInfo;
       delete (defaultContent as any).hero;
       delete (defaultContent as any).about;
       delete (defaultContent as any).footer;
       // Be careful with nested UI elements if only some were moved
       if (defaultContent.ui) {
         delete (defaultContent.ui as any).phone;
         delete (defaultContent.ui as any).address;
         delete (defaultContent.ui as any).mail;
         // Consider if other ui fields should remain or be removed
       }
       // Keep contact form labels, etc.

       await saveTranslations({ dataToSave: defaultContent });
       // Update local state after save completes (saveTranslations handles toasts)
       setTranslations(prev => ({ ...prev, [TARGET_LANGUAGE]: defaultContent }));
     }
   }, [showToast, saveTranslations]); // Dependencies


  return {
    translations, // Still needed for parts not moved to site_settings
    siteSettings,   // New state for site settings data
    isLoading,
    saveStatus,
    setSaveStatus,
    setTranslations, // Keep if direct manipulation is needed elsewhere
    setSiteSettings, // Expose setter for site settings
    handleTranslationsChange, // Renamed original handler
    handleSiteSettingChange,  // New handler for site settings
    saveTranslations, // Renamed original save function
    saveSiteSettings,   // New save function for site settings
    handleDeleteItem, // Keep if it handles other deletions
    resetSiteSettingsToDefaults, // New reset function
    resetTranslationsToDefaults, // Renamed original reset function
  };
};
