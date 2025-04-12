import React from 'react';
import IconRenderer from '../../../components/common/IconRenderer'; // Adjust path
import HeroImage from './HeroImage'; // Sibling component
import { useSite } from '../../../contexts/SiteSettingsContext'; // Adjust path

function HeroSection() {
  const { t } = useSite(); // Get the translation function

  return (
    <section id="home" className="relative overflow-hidden">
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
    </section>
  );
}

export default HeroSection;
