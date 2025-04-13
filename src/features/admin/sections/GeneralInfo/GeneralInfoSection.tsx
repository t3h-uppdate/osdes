import React, { useState } from 'react'; // Removed useCallback, useRef
// Icons
import IconRenderer from '../../../../components/common/IconRenderer'; // Import central renderer
// Removed Dnd imports as they are no longer needed here
// Import types from useAdminData (excluding link list handler)
import { SiteConfigData, TranslationsData } from '../../hooks/useAdminData';

// Define a list of icons suitable for logos
const LOGO_ICON_OPTIONS = [
  { name: "-- Select Icon --", value: "" }, // Option to clear selection
  { name: "Home (Lucide)", value: "Home" },
  { name: "React Logo (FA)", value: "FaReact" },
  { name: "Code (FA)", value: "FaCode" },
  { name: "Globe (FA)", value: "FaGlobe" },
  { name: "Star (FA)", value: "FaStar" },
  { name: "Bolt (FA)", value: "FaBolt" },
  { name: "Vite Logo (SI)", value: "SiVite" },
  { name: "Ionic Logo (IO5)", value: "IoLogoIonic" },
  { name: "Design Services (MD)", value: "MdOutlineDesignServices" },
  // Add more icons here as needed, ensure they are available in react-icons
];


// Define the props the component will accept based on the new hook structure
interface GeneralInfoSectionProps {
  siteConfig: SiteConfigData; // Still need siteConfig for logo etc.
  translationsData: TranslationsData;
  // Add the generic input handler prop
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  // Keep handleSiteConfigChange if needed for other non-input config changes, but update Omit
  handleSiteConfigChange: (key: keyof Omit<SiteConfigData, 'id' | 'updated_at' | 'nav_links' | 'footer_links' | 'footer_links_title'>, value: string | null) => void;
  handleTranslationChange: (key: string, value: string) => void;
  saveSiteConfig: () => Promise<void>; // Keep saveSiteConfig for logo etc.
  saveTranslation: (key: string, value: string) => Promise<void>;
  isLoading: boolean;
  saveStatus: string;
}

// Refactored EditableField component
const EditableField: React.FC<{
  label: string; // Display label
  identifier: string; // Unique key for this field (e.g., 'logo_url', 'site.title')
  value: string;
  onChange: (value: string) => void; // Generic onChange handler
  onSave?: () => void; // Optional: Handler to trigger save on blur/enter
  isEditing: boolean;
  setEditingIdentifier: (identifier: string | null) => void;
  isUrl?: boolean; // Optional flag for URL input type
  isTextarea?: boolean; // Optional flag for textarea
  isSelect?: boolean; // Flag for select dropdown
  selectOptions?: { name: string; value: string }[]; // Options for select
}> = ({
  label, identifier, value, onChange, onSave, isEditing, setEditingIdentifier,
  isUrl = false, isTextarea = false, isSelect = false, selectOptions = []
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleBlur = () => {
    setEditingIdentifier(null);
    onSave?.(); // Trigger save if handler is provided
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Added type to event
    // Check it's not textarea before saving on Enter
    // Use type assertion to access tagName safely
    const targetElement = e.target as (HTMLInputElement | HTMLTextAreaElement);
    if (e.key === 'Enter' && !isTextarea && targetElement.tagName !== 'TEXTAREA') {
        handleBlur();
    } else if (e.key === 'Escape') {
        setEditingIdentifier(null); // Cancel editing on Escape
        // Optionally revert changes here if needed
    }
  };

  // Find the display name for the current value if it's a select
  const displayValue = isSelect
    ? selectOptions?.find(opt => opt.value === value)?.name ?? value // Show name or value if not found
    : value;

  return (
    <div key={identifier} className="mb-4">
      <label htmlFor={identifier} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
        {label}
      </label>
      {isEditing ? (
        isSelect ? (
          <select
            id={identifier}
            name={identifier}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
            onBlur={handleBlur} // Save on blur
            autoFocus
          >
            {selectOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        ) : isUrl ? (
          <input
            type="url"
            id={identifier}
            name={identifier}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown} // Keep keydown for URL/Text
            autoFocus
          />
        ) : isTextarea ? (
          <textarea
            id={identifier}
            name={identifier}
            rows={value.length > 100 ? 5 : 3}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
           <input
            type="text"
            id={identifier}
            name={identifier}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )
      ) : (
        <div
          className="relative block w-full flex-1 rounded-md p-2 cursor-pointer min-h-[40px] whitespace-pre-wrap text-gray-800 dark:text-gray-200 transition-colors duration-150 ease-in-out break-words group hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline"
          onClick={() => setEditingIdentifier(identifier)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Display the resolved name for select, or the value itself */}
          {displayValue || <span className="text-gray-400 dark:text-gray-500 italic">Click to edit...</span>}
          {isHovering && (
            <IconRenderer iconName="Pencil" size={14} className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );
}; // <-- Added missing closing brace here

// --- GeneralInfoSection Component ---
const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  siteConfig,
  translationsData,
  handleInputChange, // Destructure the new handler
  // handleSiteConfigChange, // Only destructure if used below
  handleTranslationChange,
  saveSiteConfig,
  saveTranslation,
  isLoading,
  saveStatus,
}) => {
  // Local state to manage which field is currently being edited
  const [editingIdentifier, setEditingIdentifier] = useState<string | null>(null);

  // Calculate button disabled state locally based on passed props
  const isSaveDisabled = isLoading || saveStatus.includes('Saving');

  // Helper to get translation value or default
  const getTranslation = (key: string, defaultValue: string = '') => translationsData[key] ?? defaultValue;

  // Define the fields to display, mapping labels to keys and handlers
  // This makes rendering cleaner - REMOVED link list related sections
  const fieldsConfig = [
    // Site Config Fields (Simple ones)
    { section: 'generalInfo', label: 'Logo Url', identifier: 'logo_url', type: 'config', isUrl: true },
    { section: 'generalInfo', label: 'Logo Icon', identifier: 'logo_icon_name', type: 'config', isSelect: true, selectOptions: LOGO_ICON_OPTIONS },
    // Translation Fields (using dot notation keys)
    { section: 'generalInfo', label: 'Site Title', identifier: 'site.title', type: 'translation' },
    { section: 'generalInfo', label: 'Site Role', identifier: 'site.role', type: 'translation' },
    { section: 'hero', label: 'Hero Title', identifier: 'hero.title', type: 'translation' },
    { section: 'hero', label: 'Hero Title 2', identifier: 'hero.title2', type: 'translation' },
    { section: 'hero', label: 'Hero Subtitle', identifier: 'hero.subtitle', type: 'translation', isTextarea: true },
    { section: 'hero', label: 'Hero Button Text', identifier: 'hero.ctaButtonText', type: 'translation' },
    // About Section Fields
    { section: 'about', label: 'About Title', identifier: 'about.title', type: 'translation' }, // Added About Title
    { section: 'about', label: 'About Description', identifier: 'about.description', type: 'translation', isTextarea: true },
    { section: 'footerText', label: 'Footer Copyright', identifier: 'footer.copyright', type: 'translation' },
    { section: 'contactInfo', label: 'Contact Phone', identifier: 'contact.phone', type: 'translation' },
    { section: 'contactInfo', label: 'Contact Address', identifier: 'contact.address', type: 'translation' },
    { section: 'contactInfo', label: 'Contact Email', identifier: 'contact.email', type: 'translation' },
    // Contact Form Fields
    { section: 'contactForm', label: 'Contact Title', identifier: 'contact.title', type: 'translation' },
    { section: 'contactForm', label: 'Contact Description', identifier: 'contact.description', type: 'translation', isTextarea: true },
    { section: 'contactForm', label: 'Name Label', identifier: 'contact.form.nameLabel', type: 'translation' },
    { section: 'contactForm', label: 'Email Label', identifier: 'contact.form.emailLabel', type: 'translation' },
    { section: 'contactForm', label: 'Message Label', identifier: 'contact.form.messageLabel', type: 'translation' },
    { section: 'contactForm', label: 'Submit Button', identifier: 'contact.form.submitButton', type: 'translation' },
    // Add new contact form fields
    // Projects Section Title - REMOVED FROM HERE

  ];

  // Group fields by section for rendering
  const groupedFields = fieldsConfig.reduce((acc, field) => {
    const section = field.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof fieldsConfig>);


  // Function to render a section card with simple EditableFields
  const renderSimpleSectionCard = (sectionKey: string, title: string, iconName: string) => (
    <div key={sectionKey} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center gap-2">
        <IconRenderer iconName={iconName} size={18} className="text-blue-500" />
        {title}
      </h3>
      {groupedFields[sectionKey]?.map(field => (
        <EditableField
          key={field.identifier}
          label={field.label}
          identifier={field.identifier}
          value={field.type === 'config'
            ? String(siteConfig[field.identifier as keyof SiteConfigData] ?? '') // Use full SiteConfigData keys here
            : getTranslation(field.identifier)}
          onChange={field.type === 'config'
            // For config fields, use handleInputChange by creating a synthetic event
            ? (v: string) => handleInputChange({ target: { name: field.identifier, value: v } } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
            // For translation fields, continue using handleTranslationChange
            : (v: string) => handleTranslationChange(field.identifier, v)}
          // Save translations on blur/enter, config saves via main button
          onSave={field.type === 'translation' ? () => saveTranslation(field.identifier, getTranslation(field.identifier)) : undefined}
          isEditing={editingIdentifier === field.identifier}
          setEditingIdentifier={setEditingIdentifier}
          isUrl={field.isUrl}
          isTextarea={field.isTextarea}
          isSelect={field.isSelect}
          selectOptions={field.selectOptions}
        />
      ))}
    </div>
  );

  // REMOVED renderLinkListSectionCard function


  return (
    // Main grid container - Reverted to 2 columns as link lists are removed
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-gray-900 dark:text-gray-100">

      {/* Column 1 */}
      <div className="space-y-6">
        {renderSimpleSectionCard('generalInfo', 'General Site Info', 'Info')}
        {renderSimpleSectionCard('hero', 'Hero Section Text', 'Image')}
        {renderSimpleSectionCard('about', 'About Section Text', 'User')}
        {/* REMOVED Projects Section Card */}
      </div>

      {/* Column 2 */}
      <div className="space-y-6">
        {renderSimpleSectionCard('footerText', 'Footer Text', 'Copyright')}
        {renderSimpleSectionCard('contactInfo', 'Contact Info', 'Phone')}
        {renderSimpleSectionCard('contactForm', 'Contact Form Text', 'MessageSquare')}
      </div>

      {/* Save Changes Area - Spans all columns */}
      {/* Note: This save button still saves the *entire* siteConfig, including links, even though they aren't edited here. */}
      {/* Consider if a separate save button is needed in LinkManagementSection or if this is acceptable. */}
      <div className="md:col-span-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
        {saveStatus && !isLoading && (
          <span className={`text-sm italic ${saveStatus.includes('Error') ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {saveStatus}
          </span>
        )}
        <button
          onClick={saveSiteConfig} // Save button now primarily saves the config settings
          className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isSaveDisabled}
        >
          {isLoading && saveStatus.includes('Saving') ? ( // Show spinner only when actively saving
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Site Config' // Changed button text
          )}
        </button>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
