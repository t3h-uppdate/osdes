import { useState, useEffect, useMemo } from 'react';
import supabase from '../config/supabaseConfig'; // Import Supabase client
import { translations as defaultTranslations } from '../config/translations';

// Define the structure of the translations, mirroring defaultTranslations
type TranslationsType = typeof defaultTranslations;
type LanguageTranslations = TranslationsType['en']; // Assuming 'en' structure is representative

export function useTranslations(language: keyof TranslationsType = 'en') {
  const [translations, setTranslations] = useState<LanguageTranslations>(defaultTranslations[language]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Use Supabase client
    if (!supabase) {
      console.error("useTranslations: Supabase client is not available.");
      setError(new Error("Supabase client not available"));
      setTranslations(defaultTranslations[language]); // Fallback to default
      setIsLoading(false);
      return;
    }

    // Reset state for potential language changes
    setIsLoading(true);
    setError(null);

    const fetchTranslations = async () => {
      // Add null check here again to satisfy TypeScript within this scope
      if (!supabase) {
          console.error("useTranslations (fetch): Supabase client is not available.");
          // Error state is already set outside, just return
          return;
      }
      try {
        // Fetch translations from Supabase table 'translations'
        // Select 'key' and 'value' columns where 'lang' matches the requested language
        const { data, error: supabaseError } = await supabase
          .from('translations')
          .select('key, value') // Select the key and value columns
          .eq('lang', language); // Filter by the 'lang' column

        if (supabaseError) {
          // Throw any Supabase error encountered during the query
          throw supabaseError;
        }

        // Check if data is an array and has elements
        if (data && data.length > 0) {
          // Construct the translations object from the fetched key-value pairs
          const fetchedTranslations = data.reduce((acc, item) => {
            if (item.key && item.value) { // Ensure key and value are present
              acc[item.key] = item.value;
            }
            return acc;
          }, {} as Record<string, string>); // Start with an empty object

          // console.log(`useTranslations: Constructed translations from Supabase for ${language}:`, fetchedTranslations); // Optional log

          // Merge the fetched translations with the defaults
          setTranslations({
            ...defaultTranslations[language], // Start with defaults
            ...fetchedTranslations // Override with fetched data
          });
        } else {
           // No translation rows found for this language in Supabase
           console.warn(`useTranslations: No translation key-value pairs found in Supabase for language '${language}', using defaults.`);
           setTranslations(defaultTranslations[language]); // Use defaults
        }
      } catch (err: any) {
        console.error(`useTranslations: Error fetching translations from Supabase for ${language}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTranslations(defaultTranslations[language]); // Fallback to default on error
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
