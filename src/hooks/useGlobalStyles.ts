import { useEffect } from 'react';
import supabase from '../config/supabaseConfig'; // Import Supabase client
import { LanguageKey } from '../types/translations'; // Import LanguageKey type if needed

// Define Supabase table and language key
const SITE_CONTENT_TABLE = 'site_content';
const TARGET_LANGUAGE: LanguageKey = 'en';

interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string;
  h3TitleColor?: string;
  textColor?: string;
  backgroundFromColor?: string;
  backgroundToColor?: string;
  sectionBgColor?: string;
}

export const useGlobalStyles = () => {
  useEffect(() => {
    if (!supabase) {
      console.error("useGlobalStyles: Supabase client not initialized correctly.");
      return;
    }

    const fetchAndApplyStyles = async () => {
      // Add null check again for async scope
      if (!supabase) {
        console.error("useGlobalStyles (fetch): Supabase client became null.");
        return;
      }
      try {
        const { data: siteContentData, error } = await supabase
          .from(SITE_CONTENT_TABLE)
          .select('content') // Select the whole content object
          .eq('language', TARGET_LANGUAGE)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // Row not found
            console.warn(`useGlobalStyles: No site content found for language '${TARGET_LANGUAGE}'. Cannot apply styles.`);
          } else {
            throw error; // Re-throw other errors
          }
          return; // Stop if no data or error occurred
        }

        // Extract styles from the content JSONB, assuming a 'styles' key
        const stylesData = siteContentData?.content?.styles as StyleData | undefined;

        if (stylesData) {
          // console.log('useGlobalStyles: Received style update from Supabase:', stylesData); // Optional log
          // Apply styles as CSS variables
          document.documentElement.style.setProperty('--color-primary', stylesData.primaryColor);
          document.documentElement.style.setProperty('--color-secondary', stylesData.secondaryColor);
          document.documentElement.style.setProperty('--font-family', stylesData.fontFamily);
          document.documentElement.style.setProperty('--color-text', stylesData.textColor || '#c6d3e2');
          document.documentElement.style.setProperty('--title-color', stylesData.titleColor || stylesData.primaryColor || '#FFFFFF');
          document.documentElement.style.setProperty('--h3-title-color', stylesData.h3TitleColor || stylesData.textColor || '#E5E7EB');
          document.documentElement.style.setProperty('--color-background', stylesData.backgroundFromColor || '#111827');
          document.documentElement.style.setProperty('--color-background-secondary', stylesData.backgroundToColor || '#1F2937');
          document.documentElement.style.setProperty('--section-bg-color', stylesData.sectionBgColor || '#374151');
          // Add other style variables as needed
        } else {
          console.warn(`useGlobalStyles: 'styles' key not found in site content for language '${TARGET_LANGUAGE}'. Using CSS defaults.`);
          // Optionally clear or set default variables here
        }
      } catch (error) {
        console.error("useGlobalStyles: Error fetching styles from Supabase:", error);
      }
    };

    fetchAndApplyStyles();
    // No cleanup needed for one-time fetch. Add Supabase Realtime subscription if needed.
  }, []); // Empty dependency array ensures this runs only once on mount
};
