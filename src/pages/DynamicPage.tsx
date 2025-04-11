import React, { useEffect } from 'react'; // Removed useState
import { Link, useParams, useLocation } from 'react-router-dom';
// Supabase client import removed, handled by the hook
import 'react-quill/dist/quill.snow.css'; // Import Quill styles to apply formatting
import { useTranslations } from '../hooks/useTranslations';
import { useDynamicPageData } from '../hooks/useDynamicPageData'; // Import the custom hook
import { format } from 'date-fns'; // Import date-fns format function
import { Helmet } from 'react-helmet-async'; // Import Helmet
import DOMPurify from 'dompurify'; // Import DOMPurify
import DynamicPageSkeleton from './DynamicPageSkeleton'; // Import the skeleton component
// Skeleton imports removed, handled by DynamicPageSkeleton
// Page type import removed, handled by the hook

// Component to render dynamic page content fetched by slug
const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL params
  const location = useLocation();
  const { page, isLoading, error } = useDynamicPageData(slug); // Use the custom hook
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations('en'); // Keep translations for UI elements

  // Log translation errors if any
  useEffect(() => {
    if (translationsError) {
      console.error("DynamicPage: Error loading translations:", translationsError);
    }
  }, [translationsError]);

  // Loading state for page fetch - Use the dedicated Skeleton component
  if (isLoading) {
    return <DynamicPageSkeleton />;
  }

  // Error state or Page Not Found - Display specific error message
  if (error || !page) {
    // Determine a title based on the error or if the page is simply null
    const errorTitle = error ? "Error Loading Page" : "Page Not Found";
    // Use the specific error message from the hook, or a default message if page is null but no error string exists
    const errorMessage = error || `The page you requested (${location.pathname}) could not be found or is not available.`;

    // Add dark mode styling to error page elements
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-900 dark:text-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">{errorTitle}</h1>
        <p className="text-xl mb-4 text-red-500">{errorMessage}</p> {/* Error text remains red */}
        <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>
      </div>
    );
  }

  // Loading state for translations (less critical, maybe show page content anyway)
  // if (isLoadingTranslations) { ... }

  // Render the fetched page content
  return (
    <> {/* Use Fragment to wrap Helmet and the main div */}
      <Helmet>
        <title>{page.title} - OS Design</title> {/* Set dynamic title */}
        {/* You could add meta description here too if available */}
        {/* <meta name="description" content={page.meta_description || page.title} /> */}
      </Helmet>
      {/* Main container - Assuming CSS variables handle dark mode */}
      <div
        className="flex flex-col min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary pb-20" // Relies on CSS vars from theme plugin
      >
        {/* Content container that grows - Removed text-center */}
        <div className="flex-grow container mx-auto px-4 py-16 backdrop-blur-sm relative">
          {/* Icon Link added at the top - Assuming CSS vars handle dark mode */}
        <Link to="/" className="absolute top-6 left-6 text-secondary hover:text-primary text-2xl" aria-label="Back to Home"> {/* Relies on CSS vars */}
          &larr;
        </Link>
        {/* Simplified Title - Assuming CSS vars handle dark mode */}
        <h1 className="text-4xl font-bold text-title text-center mb-8">{page.title}</h1> {/* Relies on CSS vars */}
        {/* Render content using Quill's CSS classes */}
        {/* WARNING: Ensure page.content is sanitized if it comes from untrusted sources */}
        {/* Content box - Assuming CSS vars handle dark mode for bg-section and text-text */}
        {/* The prose classes handle typography styling, dark:prose-invert adjusts it for dark backgrounds */}
        <div className="p-6 md:p-8 prose dark:prose-invert max-w-none bg-section text-text rounded-lg shadow-md"> {/* Added shadow */}
          {/* Apply ql-snow and ql-editor for Quill styles */}
          <div className="ql-snow">
            {/* Sanitize content before rendering */}
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}></div>
          </div>
           {/* Display created_at and updated_at inside content box, aligned right - Added dark mode variants */}
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-right border-t border-gray-700 dark:border-gray-600 pt-4">
            {page.created_at && (
              <p>{t.ui?.page_created_at_label || 'Created:'} {format(new Date(page.created_at), 'yyyy-MM-dd HH:mm')}</p>
            )}
            {page.updated_at && page.updated_at !== page.created_at && ( // Only show updated if different from created
              <p>{t.ui?.page_updated_at_label || 'Last Updated:'} {format(new Date(page.updated_at), 'yyyy-MM-dd HH:mm')}</p>
            )}
          </div>
        </div>
        {/* Alternative for plain text: <p className="text-lg leading-relaxed text-text">{page.content}</p> */}
      </div>
      {/* Footer removed as copyright is handled in MainSite via SiteSettingsContext */}
    </div>
  </> // Close the Fragment
  );
};

export default DynamicPage;
