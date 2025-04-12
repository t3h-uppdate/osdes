import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo'; // Adjust path as needed
import IconRenderer from '../common/IconRenderer'; // Adjust path as needed
import { useSite } from '../../contexts/SiteSettingsContext'; // Adjust path as needed

function Footer() {
  const { siteConfig, t } = useSite(); // Get siteConfig and t function

  return (
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
  );
}

export default Footer;
