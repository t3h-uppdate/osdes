import React, { useState, useCallback } from 'react';
import { Trash2, PlusSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'; // Updated icons
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import notification hook
import { useServiceManagement } from './hooks/useServiceManagement'; // Import the new hook
import { ServiceItem } from './types'; // Keep type import

// Props are no longer needed as data comes from the hook
const ServicesSection: React.FC = () => {
  const {
    services,
    isLoading,
    error,
    addService,
    updateService,
    deleteService,
  } = useServiceManagement(); // Use the new hook

  const { requestConfirmation } = useNotifications(); // Get confirmation function
  // State to track the expanded state of each item { serviceId: boolean }
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleItemExpansion = (serviceId: string) => {
    // Use serviceId as key
    setExpandedItems(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId] // Toggle the state for the specific service ID
    }));
  };

  // Handle adding a new service with default values
  const handleAddNewServiceClick = useCallback(() => {
    const defaultService: Omit<ServiceItem, 'id'> = {
      title: 'New Service',
      description: 'Enter description here.',
      icon: '', // Default icon if applicable
      sort_order: services.length, // Append to the end by default
    };
    addService(defaultService);
  }, [addService, services.length]);

  // Handle input changes and trigger update
  const handleServiceChange = useCallback((serviceId: string, field: keyof ServiceItem, value: string) => {
    updateService(serviceId, { [field]: value });
  }, [updateService]);

  // Handle deletion confirmation
  const handleDeleteClick = useCallback((serviceId: string, serviceTitle: string) => {
     requestConfirmation({
        message: `Are you sure you want to delete service "${serviceTitle || `Item #${serviceId}`}"?\nThis action cannot be undone.`,
        onConfirm: () => deleteService(serviceId),
        confirmText: 'Delete Service',
        title: 'Confirm Deletion'
      });
  }, [deleteService, requestConfirmation]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading services...</span>
      </div>
    );
  }

  if (error) {
    // Use a more styled error box
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading services:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title is removed - managed elsewhere or hardcoded if needed */}

      {/* Add New Service Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNewServiceClick} // Use the new handler
          disabled={isLoading} // Disable button while loading/saving
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" // Changed color to indigo for consistency
          aria-label="Add new service item"
        >
          <PlusSquare size={16} /> Add New Service
        </button>
      </div>

      {/* Service Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
          Service Items ({services.length})
        </h3>
        {services.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No services added yet. Click "Add New Service" to begin.</p>
        ) : (
          // Use services array from the hook
          services.map((service) => {
            // Use service.id as the key and for state management
            const isExpanded = expandedItems[service.id] || false;

            return (
              // Use service.id as the key
              <div key={service.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 relative group"
                  onClick={() => toggleItemExpansion(service.id)} // Use service.id
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(service.id); }}
                  aria-expanded={isExpanded}
                  aria-controls={`service-content-${service.id}`} // Use service.id
                >
                  {/* Chevron Icon */}
                  <div className="mr-3 text-gray-500 dark:text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {/* Service Title Input (inside header) */}
                  <div className="flex-grow mr-2">
                    <label htmlFor={`service-title-${service.id}`} className="sr-only">
                      Service Title - {service.title}
                    </label>
                    <input
                      id={`service-title-${service.id}`} // Use service.id
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        // Call updateService via handler
                        handleServiceChange(service.id, 'title', e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-70"
                      placeholder="Service Title"
                      disabled={isLoading} // Disable input during loading/saving
                    />
                  </div>

                  {/* Delete Button (inside header) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Call deleteService via handler
                      handleDeleteClick(service.id, service.title);
                    }}
                    disabled={isLoading} // Disable button during loading/saving
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete service ${service.title}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Collapsible Content (Description, Icon, Sort Order) */}
                {isExpanded && (
                  <div id={`service-content-${service.id}`} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 space-y-4">
                    {/* Description */}
                    <div>
                      <label htmlFor={`service-description-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`service-description-${service.id}`} // Use service.id
                        value={service.description || ''}
                        onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter service description"
                        disabled={isLoading}
                      />
                    </div>
                    {/* Icon Input (Optional) */}
                    <div>
                       <label htmlFor={`service-icon-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Icon (Optional)
                      </label>
                      <input
                        id={`service-icon-${service.id}`}
                        type="text"
                        value={service.icon || ''}
                        onChange={(e) => handleServiceChange(service.id, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="e.g., 'icon-class-name' or 'path/to/icon.svg'"
                        disabled={isLoading}
                      />
                    </div>
                     {/* Sort Order Input (Optional) */}
                    <div>
                       <label htmlFor={`service-sort-${service.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Sort Order (Optional)
                      </label>
                      <input
                        id={`service-sort-${service.id}`}
                        type="number"
                        value={service.sort_order ?? ''} // Handle potential undefined value
                        onChange={(e) => handleServiceChange(service.id, 'sort_order', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="e.g., 0, 1, 2..."
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ServicesSection;
