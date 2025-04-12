import { useState, useEffect, useMemo, useCallback } from 'react';
import supabase from '../config/supabaseConfig'; // Import Supabase client
// Default translations might still be useful for fallback or initial structure
// import { translations as defaultTranslations } from '../config/translations';

// Define the structure for the fetched key-value pairs
type TranslationRecord = Record<string, string>;
// Define the type for the translation function
type TFunction = (key: string, defaultValue?: string) => string;

export function useTranslations(language: string = 'en') { // Language can be any string now
  // State to hold the flat key-value pairs
  const [translations, setTranslations] = useState<TranslationRecord>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Use Supabase client
    // Use Supabase client
    if (!supabase) {
      console.error("useTranslations: Supabase client is not available.");
      setError(new Error("Supabase client not available"));
      setTranslations({}); // Fallback to empty object
      setIsLoading(false);
      return;
    }

    // Reset state for potential language changes
    setIsLoading(true);
    setError(null);

    const fetchTranslations = async () => {
      try {
        // Add null check here again to satisfy TypeScript within this scope
        if (!supabase) {
            console.error("useTranslations (fetchTranslations): Supabase client is not available.");
            throw new Error("Supabase client not available");
        }
        // Fetch translations from Supabase table 'translations'
        const { data, error: supabaseError } = await supabase
          .from('translations')
          .select('key, value')
          .eq('language', language);

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the array of {key, value} into a flat Record<string, string>
        const fetchedTranslations = data?.reduce((acc, item) => {
          if (item.key) { // Ensure key is not null/undefined
            acc[item.key] = item.value ?? ''; // Use empty string for null values
          }
          return acc;
        }, {} as TranslationRecord) ?? {}; // Default to empty object if data is null

        setTranslations(fetchedTranslations);
        if (Object.keys(fetchedTranslations).length === 0) {
          console.warn(`useTranslations: No translation key-value pairs found in Supabase for language '${language}'.`);
        }

      } catch (err: any) {
        console.error(`useTranslations: Error fetching translations from Supabase for ${language}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setTranslations({}); // Fallback to empty object on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();

    // Add Supabase real-time subscription if needed later

  }, [language]); // Re-run effect if language changes

  // Create the translation function 't'
  // Use useCallback to memoize the function itself
  const t: TFunction = useCallback((key: string, defaultValue?: string): string => {
    // Return the value from the state object, or the default, or the key itself
    return translations[key] ?? defaultValue ?? key;
  }, [translations]); // Recreate the function only if the translations object changes

  // Return the t function, loading state, and error state
  return { t, isLoading, error };
}
