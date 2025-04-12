import React from 'react';
import IconRenderer from './IconRenderer'; // Adjust path if needed
// Assuming type definition path - adjust if SocialLink type is defined elsewhere
import { SocialLink } from '../../pages/hooks/useSocialLinks'; // Updated path
// Use the simpler function type matching the context
// import { TFunction } from 'i18next'; // Type for the translation function

interface SocialLinksSectionProps {
  socialLinks: SocialLink[];
  t: (key: string, defaultValue?: string) => string; // Match the type from SiteContext
}

function SocialLinksSection({ socialLinks, t }: SocialLinksSectionProps) {
  if (!socialLinks || socialLinks.length === 0) {
    return null; // Don't render anything if there are no links
  }

  return (
    <section id="links" className="py-12 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
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
    </section>
  );
}

export default SocialLinksSection;
