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
              {t('site.role', 'Building better digital experiences.')} {/* Example new key */}
            </p>
          </div>
          <div>
            {/* Use dynamic title from siteConfig, fallback to 'Quick Links' */}
            <h3 className="text-white font-semibold mb-4">{siteConfig?.footer_links_title || 'Quick Links'}</h3>
            <ul className="space-y-2">
              {/* Dynamically render footer links */}
              {siteConfig?.footer_links && siteConfig.footer_links.length > 0 ? (
                siteConfig.footer_links.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} className="text-gray-400 hover:text-white">
                      {link.text}
                    </a>
                  </li>
                ))
              ) : (
                // Fallback if no links are configured
                <li><span className="text-gray-500 italic">No links configured.</span></li>
              )}
              {/* Keep Admin Login separate if desired */}
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
