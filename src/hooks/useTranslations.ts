import { useState, useEffect, useMemo } from 'react';
import supabase from '../config/supabaseConfig'; // Import Supabase client
import { translations as defaultTranslations } from '../config/translations';

// Define the structure of the translations, mirroring defaultTranslations
type TranslationsType = typeof defaultTranslations;
type LanguageTranslations = TranslationsType['en']; // Use 'en' as the canonical structure

export function useTranslations(language: keyof TranslationsType = 'en') {
  // Initialize state with the canonical 'en' structure
  const [translations, setTranslations] = useState<LanguageTranslations>(defaultTranslations['en']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Use Supabase client
    if (!supabase) {
      console.error("useTranslations: Supabase client is not available.");
      setError(new Error("Supabase client not available"));
      // Fallback to 'en' defaults if Supabase isn't available
      setTranslations(defaultTranslations['en']);
      setIsLoading(false);
      return;
    }

    // Reset state for potential language changes
    setIsLoading(true);
    setError(null);

    const fetchTranslations = async () => {
      // Redundant Supabase check removed here
      try {
        // Fetch translations from Supabase table 'translations'
        // Select 'key' and 'value' columns where 'lang' matches the requested language
        // Use non-null assertion '!' as supabase is checked above
        const { data, error: supabaseError } = await supabase!
          .from('translations')
          .select('key, value') // Select the key and value columns
          .eq('lang', language); // Filter by the 'lang' column

        if (supabaseError) {
          // Throw any Supabase error encountered during the query
          throw supabaseError;
        }

        // Start building the final translations based on the 'en' structure
        let finalTranslations: LanguageTranslations = { ...defaultTranslations['en'] };

        // Layer language-specific defaults, only if keys exist in 'en' structure
        const languageDefaults = defaultTranslations[language] || {};
        for (const key in languageDefaults) {
          if (key in finalTranslations) {
            (finalTranslations as any)[key] = (languageDefaults as any)[key];
          }
        }

        // Layer fetched data, only if keys exist in 'en' structure
        if (data && data.length > 0) {
          data.forEach(item => {
            if (item.key && item.value && item.key in finalTranslations) {
              (finalTranslations as any)[item.key] = item.value;
            }
          });
          // console.log(`useTranslations: Applied fetched translations for ${language}`);
        } else {
          console.warn(`useTranslations: No translation key-value pairs found in Supabase for language '${language}', using defaults.`);
        }

        setTranslations(finalTranslations); // Set the correctly typed final object

      } catch (err: any) {
        console.error(`useTranslations: Error fetching translations from Supabase for ${language}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));

        // Fallback: 'en' defaults merged with valid language defaults
        let fallbackTranslations: LanguageTranslations = { ...defaultTranslations['en'] };
        const languageDefaults = defaultTranslations[language] || {};
        for (const key in languageDefaults) {
          if (key in fallbackTranslations) {
            (fallbackTranslations as any)[key] = (languageDefaults as any)[key];
          }
        }
        setTranslations(fallbackTranslations);

      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();

    // No cleanup needed for one-time fetch.
    // If you need real-time updates, you'd use Supabase subscriptions here
    // and return the unsubscribe function.

  }, [language]); // Re-run effect if language changes

  // Memoize the translations object to prevent unnecessary re-renders
  const t = useMemo(() => translations, [translations]);

  return { t, isLoading, error };
}
