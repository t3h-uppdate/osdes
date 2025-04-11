// Removed incorrect import for ProjectsSection
import { ServiceItem } from '../features/admin/sections/Services/types'; // Adjust import path

// Define the structure for individual project translations
interface ProjectTranslation {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

// Define the overall structure for the 'en' translations object explicitly
// This provides better type safety than relying solely on 'typeof'
interface EnglishTranslations {
  // Added UI section based on src/config/translations.ts
  ui: {
    everythingYouNeed: string;
    features: { title: string; description: string }[]; // Assuming this structure
    contactDescription: string;
    quickLinks: string;
    contactInfo: string;
    // phone removed
    // address removed
    // mail removed
    links: string;
    home: string;
    getStarted: string;
  };
  // generalInfo removed
  // hero removed
  about: {
    title: string; // Keep title if used as section header
    // description removed
  };
  // Updated projects type to match src/config/translations.ts structure (Keep as is)
  projects: {
    title: string;
    // Index signature for project entries like 'project1', 'project2'
    [key: string]: ProjectTranslation | string; // Value can be ProjectTranslation or the top-level title string
  };
  contact: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
  };
  services: {
      title: string;
      list: ServiceItem[];
  };
  footer: { // Keep footer object if needed for future translations
    // copyright removed
  };
}

// Define the main TranslationsType using the explicit structure
export interface TranslationsType {
  en: EnglishTranslations;
  // Add other languages here if needed in the future
}

// LanguageKey type - currently only 'en' is used
export type LanguageKey = keyof TranslationsType; // Make it dynamic based on defined languages
