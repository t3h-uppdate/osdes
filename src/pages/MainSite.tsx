import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { motion } from 'framer-motion'; // Import motion
import { Home, Mail, ArrowRight, Phone, MapPin } from 'lucide-react'; // Removed Menu, X, Moon, Sun
import { useNotifications } from '../contexts/NotificationContext';
import { useSocialLinks, iconComponents } from '../hooks/useSocialLinks'; // Import the hook and icons
import { useTranslations } from '../hooks/useTranslations'; // Keep for remaining translations
import Navigation from '../components/layout/Navigation'; // Import the new Navigation component
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import ServicesSection from '../features/services/components/ServicesSection';
import ContactSection from '../features/contact/components/ContactSection';
import HeroImage from '../features/hero/components/HeroImage';
import ProjectsSection from '../features/projects/components/ProjectsSection';
import { useFetchProjects } from '../features/projects/hooks/useFetchProjects';
import BlogSection from '../features/blog/components/BlogSection'; // Import BlogSection
import { useDynamicPages } from '../hooks/useDynamicPages'; // Import the hook for dynamic pages
import { pageVariants, pageTransition } from '../config/animations'; // Corrected import path
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import the spinner

// Language type
type Language = 'en' | 'sv' | 'ar';

// Removed local animation variants and transition


function MainSite() {
  useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Keep for mobile menu toggle
  // const [isDarkMode, setIsDarkMode] = useState(false); // Remove local dark mode state
  const [language, setLanguage] = useState<Language>('en');

  // Use the hook to get translations
  const { t: translationsData, isLoading: isLoadingTranslations, error: translationsError } = useTranslations(language);
  // Use the new hook to get site settings
  const settings = useSiteSettings();
  // Use the hook to get social links
  const { socialLinks, isLoading: isLoadingSocialLinks, error: socialLinksError } = useSocialLinks();
  // Use the hook to get projects
  const { projects, isLoading: isLoadingProjects, error: projectsError } = useFetchProjects();
  // Use the hook to get dynamic pages (blog posts)
  const { dynamicPages, loadingPages, errorPages } = useDynamicPages();

  // Combine loading states
  const isLoading = isLoadingTranslations || isLoadingSocialLinks || isLoadingProjects || loadingPages;
  // Combine error states (prioritize showing an error)
  const error = translationsError || socialLinksError || projectsError || errorPages;

  // The useTranslations hook returns the translations for the current language directly.
  const t = translationsData;


  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  // Removed staticT, displayData, servicesList, uiStrings, heroData derivations

  // Loading indicator (consider checking settings loading state if available)
  // Also check if settings object itself is loaded if useSiteSettings provides that
  if (isLoading || !settings) { // Added check for settings object
    // Use the LoadingSpinner component
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} /> {/* Adjust size as needed */}
      </div>
    );
  }

  // Optional: Display error message
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading site data: {errorMessage}</div>;
  }

  // If settings are loaded but translations are not yet (edge case), show loading or default UI
  // This prevents errors trying to access 't' before it's ready
  // if (!t) {
  //   return <div className="min-h-screen flex items-center justify-center">Loading translations...</div>;
  // }


  // Remove isDarkMode check from main div class - context handles this on <html>
  // Add base dark mode styles here
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`min-h-screen ${language === 'ar' ? 'rtl' : ''} bg-white text-gray-900 dark:bg-gray-900 dark:text-white`}
    >
      {/* Use the new Navigation component */}
      {/* Ensure 't' and 'settings' are available before rendering Navigation */}
      {t && settings && (
        <Navigation
          // isDarkMode={isDarkMode} // Remove prop
          // setIsDarkMode={setIsDarkMode} // Remove prop
          language={language}
          handleLanguageChange={handleLanguageChange}
          settings={settings}
          t={t}
          dynamicPages={dynamicPages}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}

      {/* Hero Section - Add dark mode text color if needed, background is handled by main div */}
      <div id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Adjust background for the text area if needed, or let main background show through */}
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 bg-white dark:bg-gray-900">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                {/* Use settings object */}
                {/* Text color should inherit from main div, but can be overridden */}
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block">{settings.hero_title}</span>
                  {/* Conditionally render title2 */}
                  {settings.hero_title2 && <span className="block text-blue-600 dark:text-blue-400">{settings.hero_title2}</span>}
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {settings.hero_subtitle}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {/* Use settings object - Rely on global dark mode class for styling */}
                    <a href="#contact" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10">
                      {settings.hero_cta_button_text}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <HeroImage /> {/* Use the new component here */}
      </div>

      {/* Services Section (using the updated component) */}
      {/* Check if t exists before accessing properties */}
      <ServicesSection
        // isDarkMode={isDarkMode} // Remove prop
        // Pass optional titles from translations; component has defaults
        sectionTitle={t?.services?.title}
        sectionSubtitle={t?.ui?.everythingYouNeed}
      />

      {/* Projects Section */}
      {/* Check if t exists before accessing properties */}
      <ProjectsSection
        projects={projects}
        title={t?.projects?.title || 'Projects'} // Corrected translation key and added optional chaining
        // isDarkMode={isDarkMode} // Remove prop
      />

      {/* Blog Section */}
      <BlogSection dynamicPages={dynamicPages} />

      {/* About Section - Rely on global dark mode class for styling */}
      <div id="about" className="py-12 bg-gray-50 dark:bg-gray-800"> {/* Use Tailwind dark: prefix */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-8"> {/* Added margin bottom */}
            {/* Use settings object - maybe just 'About Us' static text? */}
            <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">About Us</h2> {/* Use Tailwind dark: prefix */}
          </div>
          <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {settings.about_description} {/* Use settings */}
          </p>
            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"> {/* Add separator */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center mb-6"> {/* Add margin bottom */}
                    {/* Use links title from ui section */}
                    <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">{t?.ui?.links}</h2> {/* Use Tailwind dark: prefix */}
                  </div>
                  <div className="flex justify-center space-x-6">
                    {/* Render dynamic social links */}
                    {socialLinks.map((link) => {
                const IconComponent = iconComponents[link.icon]; // Get the icon component based on the key
                return IconComponent ? (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name} // Add aria-label for accessibility
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-400 transition-colors" // Use Tailwind dark: prefix
                  >
                    <IconComponent size={24} />
                  </a>
                ) : null; // Optionally render nothing if icon component not found
              })}
            </div>
          </div>
        </div>
        )} {/* Closing parenthesis for socialLinks conditional */}
      </div> {/* Correct closing div for max-w-7xl container */}
    </div> {/* Correct closing div for #about section */}

      {/* Contact Section (using the new component) */}
      {/* Ensure t.contact exists before passing */}
      {t?.contact && (
        <ContactSection
          // isDarkMode={isDarkMode} // Remove prop
          // Pass translations directly from the hook, including UI strings
          contactTranslations={t.contact}
          contactDescriptionTranslation={t?.ui?.contactDescription || ''} // Pass contactDescription from ui section
        />
      )}

      {/* Footer - Rely on global dark mode class for styling */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-800"> {/* Footer is always dark */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Home className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-semibold text-white">{settings.site_title || 'OS Design'}</span> {/* Use site_title */}
              </div>
              <p className="mt-4 text-gray-400">
                {'Building better digital experiences for forward-thinking businesses.'} {/* Replaced non-existent settings.footer_description */}
              </p>
            </div>
            <div>
              {/* Use quickLinks title from ui section */}
              <h3 className="text-white font-semibold mb-4">{t?.ui?.quickLinks}</h3>
              <ul className="space-y-2">
                 {/* Use home title from ui section */}
                <li><a href="#home" className="text-gray-400 hover:text-white">{settings.site_title}</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white">{t?.services?.title}</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-white">{t?.projects?.title}</a></li> {/* Corrected key */}
                <li><a href="#blog" className="text-gray-400 hover:text-white">{t?.ui?.blog}</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">{settings.about_description ? 'About' : t?.about?.title}</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">{t?.contact?.title}</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li> {/* Consider making Login translatable */}
              </ul>
            </div>
            <div>
               {/* Use contactInfo title from ui section (keep t) */}
              <h3 className="text-white font-semibold mb-4">{t?.ui?.contactInfo}</h3>
              <ul className="space-y-2">
                 {/* Use settings for phone/address/mail */}
                <li className="flex items-center text-gray-400">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{settings.contact_phone}</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-5 w-5 mr-2" />
                  <a href={`mailto:${settings.contact_mail}`} className="hover:text-blue-400 transition-colors">
                    <span>{settings.contact_mail}</span>
                  </a>
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{settings.contact_address}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            {/* Use settings object */}
            <p className="text-gray-400">{settings.footer_copyright}</p>
          </div>
        </div>
      </footer>
    </motion.div> // Close motion.div
  );
}

export default MainSite; // Export the new component
