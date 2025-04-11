import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { translations } from '../src/config/translations'; // Adjust path as needed

// dotenv will be preloaded via command line flag, so config() call is removed here.

// Use the variable names found in the .env file
const supabaseUrl: string | undefined = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.VITE_SUPABASE_ANON_KEY;

interface TranslationEntry {
  lang: string;
  key: string;
  value: string;
}

// Function to flatten the nested translation object
function flattenTranslations(obj: any, parentKey = '', lang: string): TranslationEntry[] {
  let entries: TranslationEntry[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively flatten nested objects
        entries = entries.concat(flattenTranslations(value, newKey, lang));
      } else if (typeof value === 'object' && value !== null && Array.isArray(value)) {
         // Handle arrays (e.g., services.list, projects) - store as JSON string
         // Or potentially flatten further if array items have consistent structure
         // For simplicity here, storing as JSON string. Adjust if needed.
         entries.push({ lang, key: newKey, value: JSON.stringify(value) });
      }
       else {
        // Add string values
        entries.push({ lang, key: newKey, value: String(value) });
      }
    }
  }
  return entries;
}

async function uploadTranslations() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Update error message to reflect the correct variable names
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in your .env file.');
    process.exit(1);
  }

  let supabase: SupabaseClient | null = null;
  try {
    // IMPORTANT: Use the service_role key for admin tasks like this if ANON_KEY lacks permissions.
    // For this script, we'll stick with ANON_KEY as provided in .env,
    // assuming appropriate RLS policies are in place for insertion.
    // If inserts fail due to permissions, you might need to use the service_role key
    // or adjust your RLS policies.
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized.');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    process.exit(1);
  }

  console.log('Processing translations...');
  let allEntries: TranslationEntry[] = [];
  for (const lang in translations) {
    if (Object.prototype.hasOwnProperty.call(translations, lang)) {
      // Type assertion needed because translations object keys are dynamic
      const langTranslations = (translations as Record<string, any>)[lang];
      allEntries = allEntries.concat(flattenTranslations(langTranslations, '', lang));
    }
  }

  console.log(`Found ${allEntries.length} translation entries.`);

  if (allEntries.length === 0) {
    console.log('No translations found to upload.');
    return;
  }

  console.log('Attempting to upload to Supabase table "translations"...');

  try {
    // Use upsert to insert new translations or update existing ones based on lang and key
    const { data, error } = await supabase
      .from('translations')
      .upsert(allEntries, { onConflict: 'lang, key' }); // Specify conflict target

    if (error) {
      console.error('Supabase error during upsert:', error.message);
      // Log more details if available
      if (error.details) console.error('Details:', error.details);
      if (error.hint) console.error('Hint:', error.hint);
      process.exit(1);
    }

    console.log('Successfully uploaded/updated translations!');
    // console.log('Upsert result:', data); // Optional: log returned data

  } catch (error) {
    console.error('An unexpected error occurred during upload:', error);
    process.exit(1);
  }
}

// Run the upload function
uploadTranslations();
