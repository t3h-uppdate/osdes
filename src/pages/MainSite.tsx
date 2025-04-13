import { useState } from 'react';
import { motion } from 'framer-motion'; // Import motion
// Icons are now handled by IconRenderer
import { useNotifications } from '../contexts/NotificationContext';
import { useSocialLinks } from './hooks/useSocialLinks'; // Updated path
// Remove useTranslations import, it's now part of useSite
import Navigation from '../components/layout/Navigation';
import { useSite } from '../contexts/SiteSettingsContext'; // Import the renamed hook
import ServicesSection from '../features/services/components/ServicesSection';
import ContactSection from '../features/contact/components/ContactSection';
// HeroImage is now used within HeroSection
import ProjectsSection from '../features/projects/components/ProjectsSection';
// import { useFetchProjects } from '../features/projects/hooks/useFetchProjects'; // Removed import
import BlogSection from '../features/blog/components/BlogSection'; // Import BlogSection
import { useDynamicPages } from './hooks/useDynamicPages'; // Updated path
import { pageVariants, pageTransition } from '../config/animations'; // Corrected import path
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import the spinner
import Footer from '../components/layout/Footer'; // Import the new Footer component
import HeroSection from '../features/hero/components/HeroSection'; // Import the new HeroSection component
import SocialLinksSection from '../components/common/SocialLinksSection'; // Import the new SocialLinksSection component
import ProductsSection from '../features/products/components/ProductsSection'; // Import the new Products section


// Removed local animation variants and transition

function MainSite() {
  useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Keep for mobile menu toggle
  // const [isDarkMode, setIsDarkMode] = useState(false); // Remove local dark mode state
  // const [language, setLanguage] = useState<Language>('en'); // Removed language state

  // Use the consolidated site context hook
  const { siteConfig, t, theme, toggleTheme, isLoading, error } = useSite(); // Destructure needed values

  // Use other hooks as before
  const { socialLinks, isLoading: isLoadingSocialLinks, error: socialLinksError } = useSocialLinks(); // Destructure hook result
  // const { projects, isLoading: isLoadingProjects, error: projectsError } = useFetchProjects(); // Removed hook call
  const { dynamicPages, loadingPages, errorPages } = useDynamicPages();

  // Combine loading states (consider if all need to block rendering)
  const isDataLoading = isLoading || isLoadingSocialLinks || loadingPages; // Removed isLoadingProjects
  // Combine error states
  const combinedError = error || socialLinksError || errorPages; // Removed projectsError

  // Removed handleLanguageChange as it's no longer needed

  // Loading indicator
  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size={48} /> {/* Adjust size as needed */}
      </div>
    );
  }

  // Optional: Display error message
  if (combinedError) {
    const errorMessage = combinedError instanceof Error ? combinedError.message : String(combinedError);
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading site data: {errorMessage}</div>;
  }

  // Main component render
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      // Theme class is applied to <html> by the context provider
      // Removed rtl class logic as only 'en' is supported
      className={`min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
    >
      {/* Use the new Navigation component */}
      <Navigation
          // Pass theme and toggleTheme from useSite context
          theme={theme}
          toggleTheme={toggleTheme}
          // language prop removed
          // handleLanguageChange prop removed
          siteConfig={siteConfig} // Pass siteConfig
          t={t} // Pass the translation function
          dynamicPages={dynamicPages}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

      {/* Hero Section */}
      <HeroSection />

      {/* Services Section - Now fetches its own titles */}
      <ServicesSection />

      {/* Products Section */}
      <ProductsSection />

      {/* Projects Section - Now fetches its own data and title from context */}
      <ProjectsSection
        // projects={projects} // Removed prop
        // title={t('projects.title', 'Featured Projects')} // Removed title prop
      />

      {/* Blog Section */}
      {/* Pass blogTitle from siteConfig, provide a fallback */}
      <BlogSection
        dynamicPages={dynamicPages}
        blogTitle={siteConfig?.blogTitle || t('blog.title', 'Blog')} // Use siteConfig or fallback translation
      />

      {/* About Section */}
      <section id="about" className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-8">
            <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">{t('about.title', 'About Us')}</h2>
          </div>
          <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {t('about.description', 'Default about description.')}
          </p>
        </div>
      </section>

                {/* Social Links Section */}
                <SocialLinksSection socialLinks={socialLinks} t={t} />

      {/* Contact Section */}
      <ContactSection
        // Pass the t function for internal translations if needed, or specific keys
        contactTitle={t('contact.title', 'Contact Us')}
        contactDescription={t('contact.description', 'Get in touch with us.')} // Updated key
        nameLabel={t('contact.form.nameLabel', 'Name')}
        emailLabel={t('contact.form.emailLabel', 'Email')}
        messageLabel={t('contact.form.messageLabel', 'Message')}
        submitButtonText={t('contact.form.submitButton', 'Send Message')}
      />

      {/* Footer */}
      <Footer />
    </motion.div>
  );
}

export default MainSite; // Export the new component
