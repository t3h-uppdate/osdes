import React from 'react';
// Import SiteSettingsData type from the hook file or a shared types file if extracted
import { SiteSettingsData } from '../../hooks/useAdminData'; // Assuming it's exported from hook
import { TranslationsType } from '../../../../types/translations';

// Define the props the component will accept, now including siteSettings data and handler
interface GeneralInfoSectionProps {
  siteSettings: SiteSettingsData; // Data from site_settings table
  handleSiteSettingChange: (key: keyof SiteSettingsData, value: string) => void; // Handler for site_settings
  translations: TranslationsType; // Still needed for fields not in site_settings (e.g., contact form labels)
  handleTranslationsChange: (path: (string | number)[], value: string) => void; // Renamed handler from hook
  editingPath: string | null; // State for which field is being edited
  setEditingPath: (path: string | null) => void; // Function to control editing state
  getStaticSectionName: (key: string) => string; // Utility to get display names
}

// Modify EditableField to accept either handler type via a union or separate props
const EditableField: React.FC<{
  fieldKey: string; // Key for display label, URL check etc. (e.g., 'siteTitle', 'heroSubtitle', 'nameLabel')
  dbKey?: keyof SiteSettingsData; // The actual key in the siteSettings object (e.g., 'site_title')
  value: string;
  path?: (string | number)[]; // Path for translations (e.g., ['contact', 'nameLabel'])
  // Pass the correct handler based on the data source
  onChangeHandler: (value: string) => void;
  editingPath: string | null; // Unique identifier of the field being edited (can be dbKey or path.join('.'))
  setEditingPath: (path: string | null) => void;
}> = ({ fieldKey, dbKey, value, path, onChangeHandler, editingPath, setEditingPath }) => {
  // Use dbKey if available for settings, otherwise construct from path for translations
  const editIdentifier = dbKey || (path ? path.join('.') : fieldKey);
  const isEditing = editingPath === editIdentifier;
  const label = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  const isUrlField = /url|link/i.test(fieldKey);

  return (
    // Use editIdentifier as the key for React reconciliation
    <div key={editIdentifier} className="mb-4">
      <label htmlFor={editIdentifier} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
        {label}
      </label>
      {isEditing ? (
        isUrlField ? (
          <input
            type="url"
            id={editIdentifier}
            name={editIdentifier}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e) => onChangeHandler(e.target.value)} // Use the passed handler
            onBlur={() => setEditingPath(null)}
            autoFocus
          />
        ) : (
          <textarea
            id={editIdentifier}
            name={editIdentifier}
            rows={value.length > 100 ? 5 : 3}
            className="block w-full flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e) => onChangeHandler(e.target.value)} // Use the passed handler
            onBlur={() => setEditingPath(null)}
            autoFocus
          />
        )
      ) : (
        <div
          className="block w-full flex-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-h-[40px] whitespace-pre-wrap text-gray-800 dark:text-gray-200 transition-colors duration-150 ease-in-out break-words"
          onClick={() => setEditingPath(editIdentifier)} // Use the identifier to start editing
        >
          {value || <span className="text-gray-400 dark:text-gray-500 italic">Click to edit...</span>}
        </div>
      )}
    </div>
  );
};


const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  siteSettings,
  handleSiteSettingChange,
  translations,
  handleTranslationsChange, // Use the renamed prop from the hook
  editingPath,
  setEditingPath,
  getStaticSectionName,
}) => {
  // No more local state or fetching needed here, data comes from props (useAdminData hook)

  // Extract data still coming from translations
  const contactData = translations.en.contact;
  // uiData is partially handled by siteSettings, partially by translations if needed

  // Define mappings from siteSettings keys (DB columns) to display keys
  // We'll use these for labels and deciding which fields to show
  const siteSettingFields: { [K in keyof SiteSettingsData]?: string } = {
    site_title: 'Site Title',
    site_role: 'Site Role',
    logo_url: 'Logo Url',
    hero_title: 'Hero Title',
    hero_title2: 'Hero Title 2',
    hero_subtitle: 'Hero Subtitle',
    hero_cta_button_text: 'Hero Button Text',
    about_description: 'About Description',
    footer_copyright: 'Footer Copyright',
    contact_phone: 'Contact Phone',
    contact_address: 'Contact Address',
    contact_mail: 'Contact Mail',
  };

  return (
    // Add dark mode text color to the main container if needed, though EditableField handles most text
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-gray-900 dark:text-gray-100">

      {/* Column 1: General Site Info & Hero */}
      <div className="space-y-6">

        {/* General Site Info Section - Uses siteSettings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            {getStaticSectionName('generalInfo')}
          </h3>
          {/* Render fields directly from siteSettings */}
          <EditableField
            fieldKey="Site Title"
            dbKey="site_title"
            value={siteSettings.site_title ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('site_title', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
          <EditableField
            fieldKey="Site Role"
            dbKey="site_role"
            value={siteSettings.site_role ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('site_role', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
          <EditableField
            fieldKey="Logo Url"
            dbKey="logo_url"
            value={siteSettings.logo_url ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('logo_url', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
        </div>

        {/* Hero Section - Uses siteSettings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            {getStaticSectionName('hero')}
          </h3>
           <EditableField
            fieldKey="Hero Title"
            dbKey="hero_title"
            value={siteSettings.hero_title ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('hero_title', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
           <EditableField
            fieldKey="Hero Title 2"
            dbKey="hero_title2"
            value={siteSettings.hero_title2 ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('hero_title2', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
           <EditableField
            fieldKey="Hero Subtitle"
            dbKey="hero_subtitle"
            value={siteSettings.hero_subtitle ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('hero_subtitle', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
           <EditableField
            fieldKey="Hero Button Text"
            dbKey="hero_cta_button_text"
            value={siteSettings.hero_cta_button_text ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('hero_cta_button_text', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
          {/* Removed incorrect closing tags and logic from previous attempt */}
        </div>
      </div>

      {/* Column 2: About, Footer, Contact Info, Contact Form Labels */}
      <div className="space-y-6">
        {/* About Section - Uses siteSettings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            {getStaticSectionName('about')}
          </h3>
          <EditableField
            fieldKey="About Description"
            dbKey="about_description"
            value={siteSettings.about_description ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('about_description', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
          {/* Removed incorrect closing tags and logic from previous attempt */}
        </div>

        {/* Footer Section - Uses siteSettings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            {getStaticSectionName('footer')}
          </h3>
           <EditableField
            fieldKey="Footer Copyright"
            dbKey="footer_copyright"
            value={siteSettings.footer_copyright ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('footer_copyright', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
         {/* Removed incorrect closing tags and logic from previous attempt */}
        </div>

        {/* Contact Section - Mixed: Info from siteSettings, Labels from translations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
            {getStaticSectionName('contact')} / Info
          </h3>

          {/* Contact Info Fields - Use siteSettings */}
           <EditableField
            fieldKey="Contact Phone"
            dbKey="contact_phone"
            value={siteSettings.contact_phone ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('contact_phone', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
           <EditableField
            fieldKey="Contact Address"
            dbKey="contact_address"
            value={siteSettings.contact_address ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('contact_address', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />
           <EditableField
            fieldKey="Contact Mail"
            dbKey="contact_mail"
            value={siteSettings.contact_mail ?? ''}
            onChangeHandler={(v) => handleSiteSettingChange('contact_mail', v)}
            editingPath={editingPath}
            setEditingPath={setEditingPath}
          />

          {/* Contact Form Labels/Placeholders - Use translations */}
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 pt-4">Contact Form Text</h4>
          {contactData ? (
            Object.entries(contactData).map(([key, value]) => {
              // Exclude the main title, render other strings
              if (key !== 'title' && typeof value === 'string') {
                const fieldPath = ['contact', key];
                return (
                  <EditableField
                    key={`contact-${key}`}
                    fieldKey={key} // Use the key from translations (e.g., 'nameLabel')
                    value={value}
                    path={fieldPath} // Pass the path for translations
                    // Pass the translation change handler
                    onChangeHandler={(v) => handleTranslationsChange(fieldPath, v)}
                    editingPath={editingPath}
                    setEditingPath={setEditingPath}
                  />
                );
              }
              return null;
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">Contact form fields not available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoSection;
