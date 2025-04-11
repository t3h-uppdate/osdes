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
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 p-4">Error loading services: {error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Section Title is removed - managed elsewhere or hardcoded if needed */}

      {/* Add New Service Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNewServiceClick} // Use the new handler
          disabled={isLoading} // Disable button while loading/saving
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
          aria-label="Add new service item"
        >
          <PlusSquare size={16} /> Add New Service
        </button>
      </div>

      {/* Service Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
          Service Items ({services.length})
        </h3>
        {services.length === 0 ? (
          <p className="text-gray-500 italic">No services added yet. Click "Add New Service" to begin.</p>
        ) : (
          // Use services array from the hook
          services.map((service) => {
            // Use service.id as the key and for state management
            const isExpanded = expandedItems[service.id] || false;

            return (
              // Use service.id as the key
              <div key={service.id} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 relative group"
                  onClick={() => toggleItemExpansion(service.id)} // Use service.id
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(service.id); }}
                  aria-expanded={isExpanded}
                  aria-controls={`service-content-${service.id}`} // Use service.id
                >
                  {/* Chevron Icon */}
                  <div className="mr-3 text-gray-500">
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
                      className="w-full px-2 py-1 border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent hover:border-gray-300 focus:bg-white"
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
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full z-10 disabled:opacity-50"
                    aria-label={`Delete service ${service.title}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Collapsible Content (Description, Icon, Sort Order) */}
                {isExpanded && (
                  <div id={`service-content-${service.id}`} className="p-4 border-t border-gray-200 bg-white space-y-4">
                    {/* Description */}
                    <div>
                      <label htmlFor={`service-description-${service.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`service-description-${service.id}`} // Use service.id
                        value={service.description || ''}
                        onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        placeholder="Enter service description"
                        disabled={isLoading}
                      />
                    </div>
                    {/* Icon Input (Optional) */}
                    <div>
                       <label htmlFor={`service-icon-${service.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Icon (Optional)
                      </label>
                      <input
                        id={`service-icon-${service.id}`}
                        type="text"
                        value={service.icon || ''}
                        onChange={(e) => handleServiceChange(service.id, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        placeholder="e.g., 'icon-class-name' or 'path/to/icon.svg'"
                        disabled={isLoading}
                      />
                    </div>
                     {/* Sort Order Input (Optional) */}
                    <div>
                       <label htmlFor={`service-sort-${service.id}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Sort Order (Optional)
                      </label>
                      <input
                        id={`service-sort-${service.id}`}
                        type="number"
                        value={service.sort_order ?? ''} // Handle potential undefined value
                        onChange={(e) => handleServiceChange(service.id, 'sort_order', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
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
