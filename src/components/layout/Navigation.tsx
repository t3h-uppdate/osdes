import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Menu, X, Sun, Moon } from 'lucide-react';
import { SiteSettingsData } from '../../features/admin/hooks/useAdminData';
import { TranslationsType } from '../../types/translations';
import { Page } from '../../features/admin/sections/Pages/types';
import { useSiteSettings } from '../../contexts/SiteSettingsContext'; // Import the context hook

type Language = 'en' | 'sv' | 'ar';

interface NavigationProps {
    // isDarkMode and setIsDarkMode are removed as they come from context now
    language: Language;
    handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    settings: SiteSettingsData;
    t: TranslationsType['en'];
    dynamicPages: Page[];
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
    // isDarkMode, setIsDarkMode removed from destructuring
    language,
    handleLanguageChange,
    settings,
    t,
    dynamicPages,
    isMenuOpen,
    setIsMenuOpen,
}) => {
    const { theme, toggleTheme } = useSiteSettings(); // Get theme state and toggle function from context
    const isDarkMode = theme === 'dark'; // Derive boolean from theme state

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
                        <Home className={`h-8 w-8 ${isDarkMode ? 'text-white' : 'text-blue-600'}`} />
                        <span className={`ml-2 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{settings.site_title || 'OS Design'}</span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#home" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.site_title}</a>
                        <a href="#services" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.services?.title}</a>
                        <a href="#projects" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.projects?.title}</a>
                        <a href="#blog" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.blog?.title}</a>
                        <a href="#about" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.about_description ? 'About' : t.about?.title}</a>
                        <a href="#contact" className={`hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.contact?.title}</a>
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
                            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
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
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <a href="#home" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.site_title}</a>
                        <a href="#services" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.services?.title}</a>
                        <a href="#projects" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.projects?.title}</a>
                        <a href="#blog" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.blog?.title}</a>
                        <a href="#about" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{settings.about_description ? 'About' : t.about?.title}</a>
                        <a href="#contact" className={`block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.contact?.title}</a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
