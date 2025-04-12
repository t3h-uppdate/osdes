import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Adjust path as needed
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Import the custom hook

// Define the structure of a hero image record in the database
export interface HeroImageRecord {
  id: number; // Assuming auto-incrementing primary key from DB
  image_url: string;
  display_order: number;
  created_at?: string; // Optional timestamp
}

// Define the return type of the hook
interface UseHeroImageManagementReturn {
  heroImages: HeroImageRecord[];
  isLoading: boolean;
  error: string | null;
  saveStatus: string; // e.g., 'Idle', 'Saving...', 'Saved', 'Error'
  fetchHeroImages: () => Promise<void>;
  saveHeroImages: (imagesToSave: HeroImageRecord[]) => Promise<void>;
  // addHeroImage: (imageUrl: string) => Promise<void>; // Might be handled by saveHeroImages
  // removeHeroImage: (id: number) => Promise<void>; // Might be handled by saveHeroImages
  // reorderHeroImages: (reorderedImages: HeroImageRecord[]) => void; // Handled locally, then saved
}

// Define the Supabase table name
const TABLE_NAME = 'hero_images'; // Replace with your actual table name

export const useHeroImageManagement = (): UseHeroImageManagementReturn => {
  const [heroImages, setHeroImages] = useState<HeroImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('Idle');
  const { showToast } = useNotifications(); // Use the custom hook

  const fetchHeroImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching hero images from ${TABLE_NAME}...`); // Debug log

    if (!supabase) {
      setError('Supabase client is not available.');
      setIsLoading(false);
      setHeroImages([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Fetched hero images:', data); // Debug log
      setHeroImages(data || []);
    } catch (err: any) {
      console.error('Error fetching hero images:', err);
      setError(`Failed to fetch hero images: ${err.message || 'Unknown error'}`);
      setHeroImages([]); // Clear images on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchHeroImages();
  }, [fetchHeroImages]);

  // Function to save the entire list (handles add, remove, reorder)
  const saveHeroImages = useCallback(async (imagesToSave: HeroImageRecord[]) => {
    setSaveStatus('Saving...');
    setError(null);
    console.log(`Saving ${imagesToSave.length} hero images to ${TABLE_NAME}...`); // Debug log

    if (!supabase) {
      setError('Supabase client is not available. Cannot save.');
      setSaveStatus('Error saving');
      return;
    }

    try {
      // 1. Delete all existing hero images for simplicity
      //    Alternatively, perform more complex upsert/delete logic
      const { error: deleteError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .neq('id', -1); // Delete all rows (use a condition that's always true)

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw new Error(`Failed to clear existing images: ${deleteError.message}`);
      }
      console.log('Cleared existing hero images.'); // Debug log

      // 2. Insert the new list with updated order
      if (imagesToSave.length > 0) {
        const imagesToInsert = imagesToSave.map((img, index) => ({
          image_url: img.image_url,
          display_order: index, // Re-assign order based on array index
         }));

        // Add detailed logging before insert
        console.log('Data being sent to Supabase for insert:', JSON.stringify(imagesToInsert, null, 2));

        // No need for null check here as it's inside the try block after the initial check
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert(imagesToInsert);

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(`Failed to insert new images: ${insertError.message}`);
        }
        console.log('Successfully inserted new hero images.'); // Debug log
      } else {
         console.log('No hero images to insert.'); // Debug log
      }


      // 3. Refetch the data to ensure consistency and get new IDs
      await fetchHeroImages();
      setSaveStatus('Saved successfully!');
      showToast('Hero images saved successfully.', 'success'); // Use showToast
      setTimeout(() => setSaveStatus('Idle'), 3000); // Reset status after a delay

    } catch (err: any) {
      const errorMessage = `Failed to save hero images: ${err.message || 'Unknown error'}`;
      console.error('Error saving hero images:', err);
      setError(errorMessage);
      setSaveStatus('Error saving');
      showToast(errorMessage, 'error'); // Use showToast
      // Optionally refetch to revert optimistic updates if any were made
      // await fetchHeroImages();
    }
  }, [fetchHeroImages, showToast]); // Add showToast to dependency array


  return {
    heroImages,
    isLoading,
    error,
    saveStatus,
    fetchHeroImages,
    saveHeroImages,
  };
};
