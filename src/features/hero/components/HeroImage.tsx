import React, { useState, useEffect, useCallback } from 'react';
import supabase from '../../../config/supabaseConfig'; // Import supabase client
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // Import spinner

// Hook to fetch hero images from Supabase
const useHeroImages = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching hero images for display...');

    if (!supabase) {
      setError('Supabase client not available.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('hero_images') // Use the correct table name
        .select('image_url') // Select only the URL
        .order('display_order', { ascending: true }); // Order by display_order

      if (fetchError) {
        console.error('Error fetching hero images:', fetchError);
        throw fetchError;
      }

      console.log('Fetched hero images for display:', data);
      // Extract just the URLs into an array of strings
      setImages(data?.map(item => item.image_url) || []);

    } catch (err: any) {
      console.error('Failed to fetch hero images:', err);
      setError(`Failed to load images: ${err.message || 'Unknown error'}`);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, isLoading, error };
};

const HeroImage: React.FC = () => {
  const { images, isLoading, error } = useHeroImages(); // Use the updated hook
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only start animation interval if images are loaded and there's more than one
    if (isLoading || error || !images || images.length <= 1) {
      return; // Exit if loading, error, or not enough images
    }

    const intervalId = setInterval(() => {
      setIsFading(true);
      // Wait for fade-out transition to complete before changing image and fading in
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsFading(false);
      }, 500); // Match this duration with the CSS transition duration
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [images]);

  // --- Render Logic ---

  // Loading State
  if (isLoading) {
    return (
      <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 h-56 sm:h-72 md:h-96 lg:h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  // Error State or No Images State
  if (error || !images || images.length === 0) {
    // Display error or a fallback (could be a static image or nothing)
    console.error("HeroImage Error:", error);
    // Optionally display the error message: <p className="text-red-500">{error}</p>
    // Return null or a placeholder if no images are available or an error occurred
    return (
       <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 h-56 sm:h-72 md:h-96 lg:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
         <span className="text-gray-500 dark:text-gray-400 text-sm">
           {error ? 'Image loading failed' : 'No hero images available'}
         </span>
       </div>
    );
    // return null; // Or return a default placeholder div
  }

  // Success State (Images Loaded)

  // Render the image carousel
  return (
    // Add aria-live for screen readers to announce changes (optional, visual change is also feedback)
    <div
      className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 h-56 sm:h-72 md:h-96 lg:h-full overflow-hidden bg-gray-100 dark:bg-gray-800"
      aria-live="polite"
      aria-atomic="true" // Ensures the entire region is announced
    >
      {images.map((src, index) => (
        <img
          // Use URL + index as key for potential duplicate URLs, though ideally URLs are unique
          key={`${src}-${index}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
            index === currentIndex && !isFading ? 'opacity-100' : 'opacity-0'
          }`}
          src={src}
          alt={`Hero image ${index + 1}`}
          loading={index === 0 ? 'eager' : 'lazy'} // Load first image eagerly
        />
      ))}
    </div>
  );
};

export default HeroImage;
