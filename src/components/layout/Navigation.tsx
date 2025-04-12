import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Icons are now handled by IconRenderer
// Import the correct types
import { SiteConfigData } from '../../features/admin/hooks/useAdminData';
import Logo from '../common/Logo'; // Import the Logo component
import IconRenderer from '../common/IconRenderer'; // Import the central IconRenderer
import { Page } from '../../features/admin/sections/Pages/types';
// No need to import useSiteSettings here, props come from MainSite

// Define the type for the translation function passed as a prop
type TFunction = (key: string, defaultValue?: string) => string;
type Language = 'en' | 'sv' | 'ar'; // Keep if language switcher is used

interface NavigationProps {
    theme: 'light' | 'dark'; // Receive theme state
    toggleTheme: () => void; // Receive toggle function
    language: Language;
    handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    siteConfig: SiteConfigData | null; // Use new SiteConfigData type, allow null
    t: TFunction; // Use the TFunction type
    dynamicPages: Page[];
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
    theme, // Destructure theme
    toggleTheme, // Destructure toggleTheme
    language,
    handleLanguageChange,
    siteConfig, // Use siteConfig
    t, // Use t function
    dynamicPages,
    isMenuOpen,
    setIsMenuOpen,
}) => {
    // Derive isDarkMode from theme prop
    const isDarkMode = theme === 'dark';

    const [showNav, setShowNav] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Effect for hiding/showing nav on scroll remains the same
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                // Hide nav only if scrolled down more than the nav height (approx 64px or 4rem) and scrolling down
                if (window.scrollY > lastScrollY && window.scrollY > 64) {
                    setShowNav(false);
                } else { // Show nav if scrolling up or near the top
                    setShowNav(true);
                }
                // Remember current scroll position for the next move
                setLastScrollY(window.scrollY);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);

            // Cleanup function
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [lastScrollY]); // Re-run effect when lastScrollY changes

    // Use derived isDarkMode for conditional styling
    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 shadow-sm transition-transform duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Title Section */}
                    <div className="flex items-center">
                        {/* Use the Logo component */}
                        <Logo
                            logoUrl={siteConfig?.logo_url}
                            logoIconName={siteConfig?.logo_icon_name}
                            altText={t('site.title', 'Site Logo')}
                            // Adjust styling for navbar height
                            className="h-8 w-auto !mb-0" // Override default margin-bottom and height
                         />
                        <span className={`ml-2 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('site.title', 'OS Design')}</span>
                    </div>

                    {/* Desktop Navigation Links - Use t function */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#home" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('ui.home', 'Home')}</a>
                        <a href="#services" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('services.title', 'Services')}</a>
                        <a href="#projects" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('projects.title', 'Projects')}</a>
                        <a href="#blog" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('ui.blog', 'Blog')}</a>
                        <a href="#about" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('about.title', 'About')}</a>
                        <a href="#contact" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('contact.title', 'Contact')}</a>
                        {/* Add dynamic pages if needed */}
                        {/* {dynamicPages.map(page => ...)} */}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector */}
                        <select
                            onChange={handleLanguageChange}
                            value={language}
                            className={`p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
                        >
                            <option value="en">English</option>
                            <option value="sv">Svenska</option>
                            <option value="ar">العربية</option>
                        </select>

                        {/* Dark Mode Toggle - Use toggleTheme from context */}
                        <button
                            onClick={toggleTheme} // Call toggleTheme from context
                            className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'text-gray-300 hover:text-white focus:ring-offset-gray-800 focus:ring-white' : 'text-gray-700 hover:text-blue-600 focus:ring-offset-white focus:ring-blue-500'}`}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <IconRenderer iconName="Sun" className="h-6 w-6" /> : <IconRenderer iconName="Moon" className="h-6 w-6" />}
                        </button>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset ${isDarkMode ? 'text-gray-300 hover:text-white focus:ring-white' : 'text-gray-700 hover:text-blue-600 focus:ring-blue-500'}`}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? <IconRenderer iconName="X" className="h-6 w-6" /> : <IconRenderer iconName="Menu" className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu - Use t function */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <a href="#home" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('ui.home', 'Home')}</a>
                        <a href="#services" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('services.title', 'Services')}</a>
                        <a href="#projects" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('projects.title', 'Projects')}</a>
                        <a href="#blog" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('ui.blog', 'Blog')}</a>
                        <a href="#about" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('about.title', 'About')}</a>
                        <a href="#contact" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('contact.title', 'Contact')}</a>
                        {/* Add dynamic pages if needed */}
                        {/* {dynamicPages.map(page => ...)} */}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
