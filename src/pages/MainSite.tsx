import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { motion } from 'framer-motion'; // Import motion
// Icons are now handled by IconRenderer
import { useNotifications } from '../contexts/NotificationContext';
import { useSocialLinks } from '../hooks/useSocialLinks'; // Remove iconComponents import
// Remove useTranslations import, it's now part of useSite
import Navigation from '../components/layout/Navigation';
import Logo from '../components/common/Logo'; // Import the Logo component
import IconRenderer from '../components/common/IconRenderer'; // Import the central IconRenderer
import { useSite } from '../contexts/SiteSettingsContext'; // Import the renamed hook
import ServicesSection from '../features/services/components/ServicesSection';
import ContactSection from '../features/contact/components/ContactSection';
import HeroImage from '../features/hero/components/HeroImage';
import ProjectsSection from '../features/projects/components/ProjectsSection';
import { useFetchProjects } from '../features/projects/hooks/useFetchProjects';
import BlogSection from '../features/blog/components/BlogSection'; // Import BlogSection
import { useDynamicPages } from '../hooks/useDynamicPages'; // Import the hook for dynamic pages
import { pageVariants, pageTransition } from '../config/animations'; // Corrected import path
import LoadingSpinner from '../components/common/LoadingSpinner'; // Import the spinner

// Language type (Only 'en' is supported now)
type Language = 'en';

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
  const { projects, isLoading: isLoadingProjects, error: projectsError } = useFetchProjects();
  const { dynamicPages, loadingPages, errorPages } = useDynamicPages();

  // Combine loading states (consider if all need to block rendering)
  const isDataLoading = isLoading || isLoadingSocialLinks || isLoadingProjects || loadingPages;
  // Combine error states
  const combinedError = error || socialLinksError || projectsError || errorPages;

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
      <div id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  {/* Use t function for translatable text */}
                  <span className="block">{t('hero.title', 'Default Hero Title')}</span>
                  {/* Conditionally render title2 using t function */}
                  {t('hero.title2') && <span className="block text-blue-600 dark:text-blue-400">{t('hero.title2')}</span>}
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {t('hero.subtitle', 'Default hero subtitle.')}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#contact" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10">
                      {t('hero.ctaButtonText', 'Get Started')}
                      <IconRenderer iconName="ArrowRight" className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <HeroImage />
      </div>

      {/* Services Section */}
      <ServicesSection
        sectionTitle={t('services.title', 'Our Services')}
        sectionSubtitle={t('ui.everythingYouNeed', 'Everything you need for your project.')}
      />

      {/* Projects Section */}
      <ProjectsSection
        projects={projects}
        title={t('projects.title', 'Featured Projects')}
      />

      {/* Blog Section */}
      <BlogSection dynamicPages={dynamicPages} />

      {/* About Section */}
      <div id="about" className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-8">
            <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">{t('about.title', 'About Us')}</h2>
          </div>
          <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {t('about.description', 'Default about description.')}
          </p>
            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center mb-6">
                    <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">{t('ui.links', 'Connect With Us')}</h2>
                  </div>
                  <div className="flex justify-center space-x-6">
                    {socialLinks.map((link) => (
                      // Use IconRenderer directly with link.icon as the name
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.name}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <IconRenderer iconName={link.icon} size={24} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Contact Section */}
      <ContactSection
        // Pass the t function for internal translations if needed, or specific keys
        contactTitle={t('contact.title', 'Contact Us')}
        contactDescription={t('ui.contactDescription', 'Get in touch with us.')}
        nameLabel={t('contact.form.nameLabel', 'Name')}
        emailLabel={t('contact.form.emailLabel', 'Email')}
        messageLabel={t('contact.form.messageLabel', 'Message')}
        submitButtonText={t('contact.form.submitButton', 'Send Message')}
      />

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                {/* Use the Logo component */}
                <Logo
                  logoUrl={siteConfig?.logo_url}
                  logoIconName={siteConfig?.logo_icon_name}
                  altText={t('site.title', 'Site Logo')}
                  // Adjust styling for footer
                  className="h-8 w-auto !mb-0 text-white" // Override margin, set height, ensure icon color is white
                />
                <span className="ml-2 text-xl font-semibold text-white">{t('site.title', 'OS Design')}</span>
              </div>
              <p className="mt-4 text-gray-400">
                {t('footer.description', 'Building better digital experiences.')} {/* Example new key */}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t('ui.quickLinks', 'Quick Links')}</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white">{t('ui.home', 'Home')}</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white">{t('services.title', 'Services')}</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-white">{t('projects.title', 'Projects')}</a></li>
                <li><a href="#blog" className="text-gray-400 hover:text-white">{t('ui.blog', 'Blog')}</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">{t('about.title', 'About')}</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">{t('contact.title', 'Contact')}</a></li>
                <li><Link to="/admin" className="text-gray-400 hover:text-white">{t('ui.adminLogin', 'Admin Login')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">{t('ui.contactInfo', 'Contact Info')}</h3>
              <ul className="space-y-2">
                {t('contact.phone') && (
                  <li className="flex items-center text-gray-400">
                    <IconRenderer iconName="Phone" className="h-5 w-5 mr-2" />
                    <span>{t('contact.phone')}</span>
                  </li>
                )}
                {t('contact.email') && (
                  <li className="flex items-center text-gray-400">
                    <IconRenderer iconName="Mail" className="h-5 w-5 mr-2" />
                    <a href={`mailto:${t('contact.email')}`} className="hover:text-blue-400 transition-colors">
                      <span>{t('contact.email')}</span>
                    </a>
                  </li>
                )}
                {t('contact.address') && (
                  <li className="flex items-center text-gray-400">
                    <IconRenderer iconName="MapPin" className="h-5 w-5 mr-2" />
                    <span>{t('contact.address')}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">{t('footer.copyright', `© ${new Date().getFullYear()} Your Company Name`)}</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

export default MainSite; // Export the new component
