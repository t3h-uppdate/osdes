// Define the explicit keys allowed based on the *current* EnglishTranslations interface
// This ensures we only check against keys defined in the actual type used by TabContentRenderer
// TODO: Consider deriving this dynamically from the actual translations object if possible
const allowedTranslationKeys = [
    // 'generalInfo', // Removed
    // 'hero', // Removed
    'about', // Keep 'about' if 'about.title' remains
    'projects',
    'contact',
    'services',
    'footer', // Keep 'footer' if the object remains (even if empty)
    'ui' // Add 'ui' as it's a valid key in translations.en
] as const; // Use 'as const' for stricter typing

// Define the type based on the updated list
export type TranslationSectionKey = typeof allowedTranslationKeys[number];

// Type guard to check if a key is a valid TranslationSectionKey
export const isValidTranslationKey = (key: string | null): key is TranslationSectionKey => {
  if (key === null) return false;
  // Check against the explicitly defined allowed keys
  return (allowedTranslationKeys as readonly string[]).includes(key);
};
