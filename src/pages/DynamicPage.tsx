import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import supabase from '../config/supabaseConfig'; // Import Supabase client
import { Page } from '../features/admin/sections/Pages/types'; // Import the Page type
import 'react-quill/dist/quill.snow.css'; // Import Quill styles to apply formatting
import { useTranslations } from '../hooks/useTranslations';

const PAGES_TABLE = 'pages';

// Component to render dynamic page content fetched by slug
const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL params
  const location = useLocation();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations('en'); // Keep translations for footer etc.

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError("No page slug provided.");
        setIsLoading(false);
        return;
      }
      if (!supabase) {
        setError("Supabase client not available.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from(PAGES_TABLE)
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true) // Ensure only published pages are fetched
          .single(); // Expect only one page per slug

        if (dbError) {
          // Handle case where the page is not found or not published
          if (dbError.code === 'PGRST116') { // PostgREST code for "Not Found"
            setError(`Page not found or not published: ${slug}`);
            setPage(null); // Ensure page state is null
          } else {
            throw dbError; // Throw other Supabase errors
          }
        } else if (data) {
          setPage(data as Page);
        } else {
          // Should be covered by PGRST116, but handle just in case
          setError(`Page not found: ${slug}`);
          setPage(null);
        }
      } catch (err: any) {
        console.error("Error fetching dynamic page:", err);
        setError(`Failed to load page: ${err.message}`);
        setPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]); // Re-fetch if slug changes

  // Log translation errors if any
  useEffect(() => {
    if (translationsError) {
      console.error("DynamicPage: Error loading translations:", translationsError);
    }
  }, [translationsError]);

  // Loading state for page fetch
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  // Error state or Page Not Found
  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-text min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl mb-4">The page you requested ({location.pathname}) could not be found or is not available.</p>
        {error && <p className="text-red-500 text-sm mb-4">({error})</p>} {/* Optionally show error detail */}
        <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>
      </div>
    );
  }

  // Loading state for translations (less critical, maybe show page content anyway)
  // if (isLoadingTranslations) { ... }

  // Render the fetched page content
  return (
    // Modified flex container to push footer down
    <div
      className="flex flex-col min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary pb-20"
    >
      {/* Content container that grows */}
      <div className="flex-grow container mx-auto px-4 py-16 backdrop-blur-sm relative text-center">
        {/* Icon Link added at the top */}
        <Link to="/" className="absolute top-6 left-6 text-secondary hover:text-primary text-2xl" aria-label="Back to Home">
          &larr;
        </Link>
        <h1 className="text-4xl bg-section font-bold container mx-auto px-4 py-16  backdrop-blur-sm text-title" text-titel>{page.title}</h1>
        {/* Render content using Quill's CSS classes */}
        {/* WARNING: Ensure page.content is sanitized if it comes from untrusted sources */}
        <div className="p-6 prose bg-section prose-invert max-w-none text-text"> {/* Keep prose for overall page styling */}
          {/* Apply ql-snow and ql-editor for Quill styles */}
          <div className="ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: page.content }}></div>
          </div>
        </div>
        {/* Alternative for plain text: <p className="text-lg leading-relaxed text-text">{page.content}</p> */}
        {/* Removed the old text link from the bottom */}
      </div>
      {/* Footer removed as copyright is handled in MainSite via SiteSettingsContext */}
    </div>
  );
};

export default DynamicPage;
