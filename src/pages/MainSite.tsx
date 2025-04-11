import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Home, Mail, Menu, X, ArrowRight, Phone, MapPin, Moon, Sun } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useSocialLinks, iconComponents } from '../hooks/useSocialLinks'; // Import the hook and icons
import { useTranslations } from '../hooks/useTranslations'; // Keep for remaining translations
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import ServicesSection from '../features/services/components/ServicesSection';
import ContactSection from '../features/contact/components/ContactSection';
import HeroImage from '../features/hero/components/HeroImage';
import ProjectsSection from '../features/projects/components/ProjectsSection';
import { useFetchProjects } from '../features/projects/hooks/useFetchProjects';
import BlogSection from '../features/blog/components/BlogSection'; // Import BlogSection
import { useDynamicPages } from '../hooks/useDynamicPages'; // Import the hook for dynamic pages

// Language type can be inferred from useTranslations hook if needed, or kept simple
type Language = 'en' | 'sv' | 'ar';

function MainSite() {
  useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Use the hook to get translations (for parts not in site_settings)
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations(language);
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


  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  // Removed staticT, displayData, servicesList, uiStrings, heroData derivations

  // Loading indicator (consider checking settings loading state if available)
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading site content...</div>;
  }

  // Optional: Display error message
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading site data: {errorMessage}</div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} ${language === 'ar' ? 'rtl' : ''}`}>
      {/* Navigation */}
      <nav className={`shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className={`h-8 w-8 ${isDarkMode ? 'text-white' : 'text-blue-600'}`} />
              <span className="ml-2 text-xl font-semibold">OS Design</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Use settings for site title, t for others */}
              <a href="#home" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.site_title}</a>
              <a href="#services" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.services?.title}</a>
              <a href="#projects" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.ui?.projects}</a>
              {/* Dynamic Page Links */}
              {dynamicPages.map(page => (
                <Link key={page.id} to={`/${page.slug}`} className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {page.title}
                </Link>
              ))}
              <a href="#about" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.about_description ? 'About' : t.about?.title}</a>
              <a href="#contact" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.contact?.title}</a>
            </div>

            {/* Language Selector - Note: SiteSettings are not multilingual in this setup */}
            <select
              onChange={handleLanguageChange}
              value={language}
              className={`text-gray-700 hover:text-blue-600 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="en">English</option>
              <option value="sv">Svenska</option>
              <option value="ar">العربية</option>
            </select>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#home" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.site_title}</a>
              <a href="#services" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.services?.title}</a>
              <a href="#projects" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.ui?.projects}</a>
              {/* Dynamic Page Links */}
              {dynamicPages.map(page => (
                <Link key={page.id} to={`/${page.slug}`} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {page.title}
                </Link>
              ))}
              <a href="#about" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.about_description ? 'About' : t.about?.title}</a>
              <a href="#contact" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.contact?.title}</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                {/* Use settings object */}
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                  <span className="block">{settings.hero_title}</span>
                  {/* Conditionally render title2 */}
                  {settings.hero_title2 && <span className="block text-blue-600">{settings.hero_title2}</span>}
                </h1>
                <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {settings.hero_subtitle}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {/* Use settings object */}
                    <a href="#contact" className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white ${isDarkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} md:py-4 md:text-lg md:px-10`}>
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
      <ServicesSection
        isDarkMode={isDarkMode}
        // Pass optional titles from translations; component has defaults
        sectionTitle={t.services?.title}
        sectionSubtitle={t.ui?.everythingYouNeed}
      />

      {/* Projects Section */}
      <ProjectsSection
        projects={projects}
        title={t.ui?.projects || 'Projects'} // Use translation or default
        isDarkMode={isDarkMode}
      />

      {/* Blog Section */}
      <BlogSection dynamicPages={dynamicPages} />

      {/* About Section */}
      <div id="about" className={`py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-8"> {/* Added margin bottom */}
            {/* Use settings object - maybe just 'About Us' static text? */}
            <h2 className={`text-base font-semibold tracking-wide uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>About Us</h2>
          </div>
          <p className="mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {settings.about_description} {/* Use settings */}
          </p>
            {/* Misplaced closing div removed here */}

            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"> {/* Add separator */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center mb-6"> {/* Add margin bottom */}
                    {/* Use links title from ui section */}
                    <h2 className={`text-base font-semibold tracking-wide uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{t.ui?.links}</h2>
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
                    className={`hover:text-blue-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
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
      {/* Contact Section (using the new component) */}
      {/* Ensure t.contact exists before passing */}
      {t.contact && (
        <ContactSection
          isDarkMode={isDarkMode}
          // Pass translations directly from the hook, including UI strings
          contactTranslations={t.contact}
          contactDescriptionTranslation={t.ui?.contactDescription || ''} // Pass contactDescription from ui section
        />
      )}

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-800'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Home className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-semibold text-white">OS Design</span>
              </div>
              <p className="mt-4 text-gray-400">
                Building better digital experiences for forward-thinking businesses.
              </p>
            </div>
            <div>
              {/* Use quickLinks title from ui section */}
              <h3 className="text-white font-semibold mb-4">{t.ui?.quickLinks}</h3>
              <ul className="space-y-2">
                 {/* Use home title from ui section */}
                <li><a href="#home" className="text-gray-400 hover:text-white">{settings.site_title}</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white">{t.services?.title}</a></li>
                <li><a href="#projects" className="text-gray-400 hover:text-white">{t.ui?.projects}</a></li>
                {/* Dynamic Page Links in Footer */}
                {dynamicPages.map(page => (
                  <li key={page.id}>
                    <Link to={`/${page.slug}`} className="text-gray-400 hover:text-white">
                      {page.title}
                    </Link>
                  </li>
                ))}
                <li><a href="#about" className="text-gray-400 hover:text-white">{settings.about_description ? 'About' : t.about?.title}</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">{t.contact?.title}</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li>
              </ul>
            </div>
            <div>
               {/* Use contactInfo title from ui section (keep t) */}
              <h3 className="text-white font-semibold mb-4">{t.ui?.contactInfo}</h3>
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
    </div>
  );
}

export default MainSite; // Export the new component
