import React from 'react';
import IconRenderer from '../../../components/common/IconRenderer';
import { useFetchServices, ServiceItem } from '../hooks/useFetchServices';
// Import the hook to access site settings
import { useSite } from '../../../contexts/SiteSettingsContext';
// No props needed anymore as titles come from context
interface ServicesSectionProps {}

const ServicesSection: React.FC<ServicesSectionProps> = () => {
  // Fetch individual service items
  const { services, isLoading: isLoadingServices, error: servicesError } = useFetchServices();
  // Fetch site configuration (including section titles)
  const { siteConfig, isLoading: isLoadingConfig } = useSite();

  // Combine loading states
  const isLoading = isLoadingServices || isLoadingConfig;
  // Combine error states (prioritize service fetch error for now)
  const error = servicesError; // || configError if siteConfig had an error state

  // Determine titles, using defaults as fallbacks
  const sectionTitle = siteConfig?.services_section_title || "Our Services";
  const sectionSubtitle = siteConfig?.services_section_subtitle || "Everything you need";

  // Handle Combined Loading State
  if (isLoading) {
    return (
      // Added min-h-[300px] for better loading appearance
      <div className="py-12 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 min-h-[300px] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <IconRenderer iconName="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
          Loading services...
        </div>
      </div>
    );
  }

  // Handle Error State - Use dark: prefix
  if (error) {
    return (
      <div className="py-12 bg-red-50 text-red-700 dark:bg-gray-800 dark:text-red-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <IconRenderer iconName="AlertTriangle" className="h-8 w-8 mx-auto mb-2 text-red-500" />
          Error loading services: {error}
        </div>
      </div>
    );
  }

  // Use fetched services
  const servicesToDisplay = services || [];

  // Use dark: prefixes for styling
  return (
    <section id="services" className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          {/* Use optional props for titles or hardcode defaults */}
          <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">{sectionTitle}</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {sectionSubtitle}
          </p>
        </div>

        <div className="mt-10">
          {servicesToDisplay.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No services available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Map over the fetched services list */}
              {servicesToDisplay.map((service: ServiceItem) => { // Use curly braces for explicit return
                return ( // Explicit return statement
                  // Use service.id as the key
                  <div key={service.id} className="relative p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    <div>
                      {/* Render icon using IconRenderer */}
                      <div className="absolute h-12 w-12 flex items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <IconRenderer iconName={service.icon || 'Tag'} className="h-6 w-6" aria-hidden="true" /> {/* Default to 'Tag' if no icon */}
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{service.title}</p>
                    </div>
                    <div className="mt-2 ml-16 text-base"> {/* Text color inherits from parent div */}
                      {service.description}
                    </div>
                  </div>
                ); // Close explicit return
              })} {/* Close map function */}
            </div>
          ) // Correctly closed ternary operator
        } {/* Close the JSX expression block */}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
