import React, { useState, useCallback, useEffect } from 'react';
import IconRenderer from '../../../../components/common/IconRenderer';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { useServiceManagement } from './hooks/useServiceManagement';
import { ServiceItem } from './types';
// Import the hook for site config management
import { useAdminData } from '../../hooks/useAdminData';

// Define a type for the local editing state
type LocalServiceState = Omit<ServiceItem, 'id' | 'is_published'> & { is_published: boolean }; // Add is_published

// Curated list of common Lucide icons for services
const commonServiceIcons = [
  'Server', 'Database', 'Code', 'Cloud', 'Terminal', 'Settings', 'Wrench', 'Shield', 'Network',
  'Cpu', 'HardDrive', 'Smartphone', 'Monitor', 'Laptop', 'Keyboard', 'Mouse', 'Printer', 'Camera',
  'Video', 'Mic', 'Mail', 'MessageSquare', 'Users', 'User', 'Briefcase', 'Book', 'FileText',
  'Folder', 'Image', 'Link', 'Globe', 'MapPin', 'Navigation', 'Package', 'Truck', 'ShoppingCart',
  'CreditCard', 'DollarSign', 'TrendingUp', 'BarChart', 'PieChart', 'Activity',
  // Add other icon names from IconRenderer.tsx if desired for the dropdown
];

// Remove LucideIconComponents map and getIconComponent function


const ServicesSection: React.FC = () => {
  // Hook for managing individual service items
  const {
    services: servicesFromHook,
    isLoading: isHookLoading,
    error,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus, // Import new function
    moveService,
  } = useServiceManagement();

  // Hook for managing site-wide configuration (including section titles)
  const {
    siteConfig,
    isLoading: isConfigLoading, // Renamed to avoid conflict
    handleInputChange: handleConfigInputChange, // Renamed to avoid conflict
    saveSiteConfig,
    saveStatus: configSaveStatus, // Renamed to avoid conflict
  } = useAdminData();

  const { requestConfirmation, showToast } = useNotifications();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [localServiceData, setLocalServiceData] = useState<{ [key: string]: LocalServiceState }>({});

  // Combine loading states
  const isLoading = isHookLoading || isConfigLoading;

  // Effect to initialize or update local state
  useEffect(() => {
    const initialLocalState: { [key: string]: LocalServiceState } = {};
    servicesFromHook.forEach(service => {
      initialLocalState[service.id] = {
        title: service.title || '',
        description: service.description || '',
        icon: service.icon || '',
        sort_order: service.sort_order ?? servicesFromHook.length,
        is_published: service.is_published ?? false, // Initialize is_published
      };
    });
    setLocalServiceData(initialLocalState);
  }, [servicesFromHook]);

  const toggleItemExpansion = (serviceId: string) => {
    setExpandedItems(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const handleAddNewServiceClick = useCallback(() => {
    const defaultService: Omit<ServiceItem, 'id'> = {
      title: 'New Service',
      description: 'Enter description here.',
      icon: '',
      sort_order: servicesFromHook.length,
      is_published: false, // Default to draft
    };
    addService(defaultService);
  }, [addService, servicesFromHook.length]);

  // Handle local input changes
  const handleLocalChange = useCallback((serviceId: string, field: keyof LocalServiceState, value: string | number | boolean) => {
    setLocalServiceData(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
      },
    }));
  }, []);

  // Handle saving changes on blur
  const handleBlurSave = useCallback((serviceId: string) => {
    const localData = localServiceData[serviceId];
    if (!localData) return;
    const originalService = servicesFromHook.find(s => s.id === serviceId);
    if (!originalService) return;

    const dataToUpdate: Partial<ServiceItem> = {
        title: localData.title,
        description: localData.description,
        icon: localData.icon,
        sort_order: Number(localData.sort_order),
        is_published: localData.is_published, // Include status
    };

    // Simple check to prevent saving if nothing changed
     if (JSON.stringify(dataToUpdate) !== JSON.stringify({
         title: originalService.title,
         description: originalService.description,
         icon: originalService.icon,
         sort_order: originalService.sort_order,
         is_published: originalService.is_published,
      })) {
        console.log(`Saving changes for service ${serviceId} on blur`);
        updateService(serviceId, dataToUpdate).catch(err => console.error("Update failed:", err));
    } else {
        console.log(`No changes detected for service ${serviceId} on blur`);
    }
  }, [localServiceData, updateService, servicesFromHook]);

  // --- Handlers for Section Title/Subtitle ---

  // Use the generic handleInputChange from useAdminData for title/subtitle
  const handleSectionTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleConfigInputChange(event); // Pass the event directly
  };

  // Save handler specifically for the section titles (calls saveSiteConfig)
  const handleSaveSectionTitles = useCallback(() => {
    // saveSiteConfig will save the entire current siteConfig state from useAdminData
    saveSiteConfig();
  }, [saveSiteConfig]);


  // --- Handlers for Service Items ---

  // Handle toggling publish status
  const handleToggleStatus = useCallback((serviceId: string) => {
      const currentStatus = localServiceData[serviceId]?.is_published ?? false;
      handleLocalChange(serviceId, 'is_published', !currentStatus); // Update local state first
      toggleServiceStatus(serviceId, currentStatus).catch(err => {
          console.error("Toggle status failed:", err);
          handleLocalChange(serviceId, 'is_published', currentStatus); // Revert local state on error
      });
  }, [localServiceData, toggleServiceStatus, handleLocalChange]);


  // Handle deletion confirmation
  const handleDeleteClick = useCallback((serviceId: string, serviceTitle: string) => {
     requestConfirmation({
        message: `Are you sure you want to delete service "${serviceTitle || `Item #${serviceId}`}"?\nThis action cannot be undone.`,
        onConfirm: async () => {
          try {
            await deleteService(serviceId);
            showToast('Service deleted successfully!', 'success');
            setLocalServiceData(prev => {
                const newState = {...prev};
                delete newState[serviceId];
                return newState;
            });
          } catch (err: any) {
            console.error("Error deleting service:", err);
            showToast(`Error deleting service: ${err.message || 'Unknown error'}`, 'error');
          }
        },
        confirmText: 'Delete Service',
        title: 'Confirm Deletion'
      });
  }, [deleteService, requestConfirmation, showToast]);


  // Display loading indicator if either hook is loading initially
  if (isLoading && servicesFromHook.length === 0 && !siteConfig?.services_section_title) {
    return (
      <div className="flex justify-center items-center p-6">
        <IconRenderer iconName="Loader2" className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading services:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title/Subtitle Inputs */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Section Display</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="services_section_title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Section Title
            </label>
            <input
              type="text"
              id="services_section_title"
              name="services_section_title" // Name must match the key in SiteConfigData
              value={siteConfig?.services_section_title || ''}
              onChange={handleSectionTitleChange}
              // onBlur={handleSaveSectionTitles} // Removed onBlur save
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="e.g., Our Services"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="services_section_subtitle" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Section Subtitle
            </label>
            <input
              type="text"
              id="services_section_subtitle"
              name="services_section_subtitle" // Name must match the key in SiteConfigData
              value={siteConfig?.services_section_subtitle || ''}
              onChange={handleSectionTitleChange}
              // onBlur={handleSaveSectionTitles} // Removed onBlur save
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="e.g., Everything you need"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end items-center">
           {configSaveStatus && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mr-4">{configSaveStatus}</p>
           )}
           <button
             onClick={handleSaveSectionTitles}
             disabled={isLoading || !!configSaveStatus} // Disable if loading or saving
             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             aria-label="Save section title and subtitle"
           >
             <IconRenderer iconName="Save" size={16} /> Save Changes
           </button>
        </div>
      </div>

      {/* Service Items Management */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between items-center mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Service Items ({servicesFromHook.length})
          </h3>
          <button
            onClick={handleAddNewServiceClick}
            disabled={isLoading} // Use combined loading state
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Add new service item"
        >
          <IconRenderer iconName="PlusSquare" size={16} /> Add New Service
          </button>
        </div>

        {/* Service Items List */}
        <div className="space-y-3">
          {servicesFromHook.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">No services added yet. Click "Add New Service" to begin.</p>
          ) : (
          servicesFromHook.map((service, index) => { // Add index
            const isExpanded = expandedItems[service.id] || false;
            const currentLocalData = localServiceData[service.id] || { title: '', description: '', icon: '', sort_order: 0, is_published: false };
            const isPublished = currentLocalData.is_published; // Use local state

            return (
              <div key={service.id} className={`rounded-lg border shadow-sm overflow-hidden ${isPublished ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50'}`}>
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 relative group"
                  onClick={() => toggleItemExpansion(service.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(service.id); }}
                  aria-expanded={isExpanded}
                  aria-controls={`service-content-${service.id}`}
                >
                   {/* Reorder Arrows */}
                   <div className="flex flex-col mr-2">
                       <button
                           onClick={(e) => { e.stopPropagation(); moveService(index, 'up'); }}
                           disabled={index === 0 || isHookLoading}
                            className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move service up"
                        >
                            <IconRenderer iconName="ArrowUp" size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); moveService(index, 'down'); }}
                            disabled={index === servicesFromHook.length - 1 || isHookLoading}
                            className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move service down"
                        >
                            <IconRenderer iconName="ArrowDown" size={16} />
                        </button>
                    </div>

                   {/* Expand/Collapse Chevron */}
                   <div className="mr-3 text-gray-500 dark:text-gray-400">
                     {isExpanded ? <IconRenderer iconName="ChevronUp" size={18} /> : <IconRenderer iconName="ChevronDown" size={18} />}
                   </div>

                   {/* Title Input in Header - Use local state */}
                  <div className="flex-grow mr-2">
                    <label htmlFor={`service-title-${service.id}`} className="sr-only">
                      Service Title - {currentLocalData.title}
                    </label>
                    <input
                      id={`service-title-${service.id}`}
                      type="text"
                      value={currentLocalData.title}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleLocalChange(service.id, 'title', e.target.value);
                      }}
                      onBlur={() => handleBlurSave(service.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-70"
                      placeholder="Service Title"
                      disabled={isHookLoading}
                    />
                     {!isPublished && <span className="ml-2 text-xs font-normal text-yellow-600 dark:text-yellow-400">(Draft)</span>}
                  </div>

                  {/* Actions: Toggle Status & Delete */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* Toggle Status Button */}
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleToggleStatus(service.id);
                       }}
                       disabled={isHookLoading}
                       className={`p-1 rounded-full focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                         isPublished
                           ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:ring-green-500'
                           : 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 focus:ring-yellow-500'
                       }`}
                       aria-label={isPublished ? 'Set service to draft' : 'Publish service'}
                        title={isPublished ? 'Published (Click to Draft)' : 'Draft (Click to Publish)'}
                      >
                        {isPublished ? <IconRenderer iconName="Eye" size={18} /> : <IconRenderer iconName="EyeOff" size={18} />}
                      </button>
                     {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(service.id, currentLocalData.title);
                      }}
                      disabled={isHookLoading}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                       aria-label={`Delete service ${currentLocalData.title}`}
                     >
                       <IconRenderer iconName="Trash2" size={18} />
                     </button>
                   </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div id={`service-content-${service.id}`} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 space-y-4">
                    {/* Description */}
                    <div>
                      <label htmlFor={`service-description-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`service-description-${service.id}`}
                        value={currentLocalData.description}
                        onChange={(e) => handleLocalChange(service.id, 'description', e.target.value)}
                        onBlur={() => handleBlurSave(service.id)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter service description"
                        disabled={isHookLoading}
                      />
                    </div>
                    {/* Icon Input */}
                    <div>
                       <label htmlFor={`service-icon-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Icon (Optional)
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          id={`service-icon-${service.id}`}
                          value={currentLocalData.icon || ''} // Ensure value is controlled, default to empty string if null/undefined
                          onChange={(e) => handleLocalChange(service.id, 'icon', e.target.value)}
                          onBlur={() => handleBlurSave(service.id)}
                          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                          disabled={isHookLoading}
                        >
                          <option value="">-- Select Icon --</option>
                          {commonServiceIcons.map(iconName => (
                            <option key={iconName} value={iconName}>
                              {iconName}
                            </option>
                          ))}
                        </select>
                         {/* Display selected icon preview using IconRenderer */}
                         <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-500 rounded">
                           <IconRenderer iconName={currentLocalData.icon || ''} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                         </div>
                       </div>
                    </div>
                    {/* Sort Order Input */}
                    <div>
                       <label htmlFor={`service-sort-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Sort Order (Read-only, use arrows to reorder)
                      </label>
                      <input
                        id={`service-sort-${service.id}`}
                        type="number"
                        value={currentLocalData.sort_order}
                        readOnly // Make sort order read-only
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-300 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        disabled={isHookLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
            })
          )}
        </div> {/* Close space-y-3 for items list */}
      </div> {/* Close the wrapping div for Service Items Management */}
    </div>
  );
};

export default ServicesSection;
