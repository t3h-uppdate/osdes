import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react';
// TODO: Install react-beautiful-dnd and @types/react-beautiful-dnd
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot, // Import snapshot type
} from 'react-beautiful-dnd';
import { useHeroImageManagement, HeroImageRecord } from './hooks/useHeroImageManagement';
import LoadingSpinner from '../../../../components/common/LoadingSpinner'; // Assuming path
import { ImageHistoryList } from '../ImageManagement/components/ImageHistoryList'; // Import for modal
import { useImageHistory } from '../ImageManagement/hooks/useImageHistory'; // Import hook for history list
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import notification hook

const HeroImageManagementSection: React.FC = () => {
  const {
    heroImages: fetchedImages,
    isLoading: isLoadingData, // Rename to avoid conflict with save loading state
    error: fetchError,
    saveStatus,
    saveHeroImages,
    fetchHeroImages, // Get fetch function if needed for refresh
  } = useHeroImageManagement();

  // Local state to manage the list for drag-and-drop and edits before saving
  const [managedImages, setManagedImages] = useState<HeroImageRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Separate state for save operation
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // State to track unsaved changes
  const { showToast } = useNotifications(); // Get showToast function

  // Hook for the image history modal
  const imageHistory = useImageHistory({
    // Adapt handleAddImage to work with the history hook's selection mechanism
    onFileSelect: (selectedUrl) => {
      if (selectedUrl) {
        handleAddImage(selectedUrl); // Call the existing add image handler
      }
      // Note: useImageHistory might expect single selection; adjust if multi-select is needed
    },
  });

  // Update local state when fetched data changes and reset changes flag
  useEffect(() => {
    setManagedImages(fetchedImages);
    setHasChanges(false); // Reset changes when new data is fetched
  }, [fetchedImages]);

  // Drag-and-drop reordering logic
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return; // Dropped outside the list or in the same position
    }

    const items = Array.from(managedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for responsive UI
    setManagedImages(items);
    setHasChanges(true); // Mark changes as made
  };

  // Image selection logic (now primarily triggered by history list callback)
  const handleAddImage = useCallback((selectedImageUrl: string) => {
    console.log('Add image:', selectedImageUrl);
    if (!selectedImageUrl) {
      showToast('Invalid image URL selected.', 'error');
      return;
    }
    if (managedImages.some(img => img.image_url === selectedImageUrl)) {
      showToast('This image is already in the hero list.', 'warning');
      return;
    }
    // Add logic to append the new image
    // Note: ID will be assigned by DB on save, use temporary or leave undefined?
    // For now, let's use a temporary negative index as key, DB handles real ID/order on save
    const tempNewImage: HeroImageRecord = {
      id: -Date.now(), // Temporary unique key for React list
      image_url: selectedImageUrl,
      display_order: managedImages.length, // Tentative order
    };
    setManagedImages(prev => [...prev, tempNewImage]);
    setIsImageSelectorOpen(false); // Close modal on selection
    setHasChanges(true); // Mark changes as made
  }, [managedImages]);

  // Image removal logic
  const handleRemoveImage = useCallback((imageIdToRemove: number) => {
    console.log('Remove image ID:', imageIdToRemove);
    setManagedImages(prev => prev.filter(image => image.id !== imageIdToRemove));
    setHasChanges(true); // Mark changes as made
  }, []);

  // Save logic
  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Pass the locally managed list (with updated order) to the hook's save function
    // The hook will handle re-assigning display_order based on array index before saving
    await saveHeroImages(managedImages);
    setIsSaving(false);
    setHasChanges(false); // Reset changes flag after successful save
  };

  // Determine if save button should be disabled
  const isSaveDisabled = isLoadingData || isSaving || saveStatus.includes('Saving') || !hasChanges; // Use hasChanges flag

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (fetchError) {
    return <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-600 rounded">Error loading hero images: {fetchError}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Hero Images</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Add, remove, and reorder the images displayed in the hero section carousel. Drag images to change their order.
      </p>

      {/* TODO: Install and configure react-beautiful-dnd */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="heroImagesList">
          {(provided: DroppableProvided) => ( // Add type for provided
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {managedImages.length === 0 && !isLoadingData && (
                <p className="text-gray-500 dark:text-gray-400 italic px-3 py-2">No hero images added yet.</p>
              )}
              {managedImages.map((image, index) => (
                // Use image_url for key and draggableId for stability across saves
                <Draggable key={image.image_url} draggableId={image.image_url} index={index}>
                  {(providedDraggable: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      // Apply conditional styling based on snapshot.isDragging
                      className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md transition-shadow duration-200 ${
                        snapshot.isDragging
                          ? 'bg-blue-50 dark:bg-blue-900 shadow-lg ring-2 ring-blue-500' // Styling when dragging
                          : 'bg-gray-100 dark:bg-gray-700 shadow-sm' // Default styling
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          {...providedDraggable.dragHandleProps}
                          className="cursor-grab text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical size={20} />
                        </button>
                        <img src={image.image_url} alt={`Hero ${index + 1}`} className="w-16 h-10 object-cover rounded" />
                        <span className="text-sm truncate max-w-xs text-gray-700 dark:text-gray-300">{image.image_url}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        aria-label="Remove image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
        <button
          onClick={() => setIsImageSelectorOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus size={18} className="-ml-1 mr-2" />
          Add Image
        </button>
        {/* Corrected Save Button Area */}
        <div className="flex items-center space-x-4">
           {saveStatus && saveStatus !== 'Idle' && (
             <span className="text-sm text-gray-500 dark:text-gray-400 italic">{saveStatus}</span>
           )}
           <button
             onClick={handleSaveChanges}
             className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             disabled={isSaveDisabled} // Apply the disabled state correctly
           >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin -ml-1 mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Modal for Image Selection */}
      {isImageSelectorOpen && (
        // Using a simple modal structure; consider a dedicated Modal component
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Select Image from Media Library</h3>
              <button
                onClick={() => setIsImageSelectorOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                 &times; {/* Close icon */}
              </button>
            </div>
            {/* Embed ImageHistoryList for selection */}
            <ImageHistoryList
              // Pass necessary props from the useImageHistory hook instance
              fileHistory={imageHistory.fileHistory}
              historyLoading={imageHistory.historyLoading}
              historyError={imageHistory.historyError}
              selectedHistoryFiles={imageHistory.selectedHistoryFiles}
              editingFileId={imageHistory.editingFileId}
              newName={imageHistory.newName}
              renameError={imageHistory.renameError}
              historyCopyStatus={imageHistory.historyCopyStatus}
              getPublicUrl={imageHistory.getPublicUrl}
              handleHistorySelectionChange={imageHistory.handleHistorySelectionChange}
              handleUseSelected={imageHistory.handleUseSelected} // This triggers onFileSelect -> handleAddImage
              handleDeleteSelected={imageHistory.handleDeleteSelected}
              handleCopyHistoryLink={imageHistory.handleCopyHistoryLink}
              handleEditClick={imageHistory.handleEditClick}
              handleCancelEdit={imageHistory.handleCancelEdit}
              handleSaveRename={imageHistory.handleSaveRename}
              handleDeleteFile={imageHistory.handleDeleteFile}
              setNewName={imageHistory.setNewName}
              // Add any specific styling or layout adjustments if needed
              // e.g., make it clear it's for selection, maybe hide some buttons?
            />
            {/* Removed simulation button */}
            {/* Correctly placed Cancel button inside the modal content div */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsImageSelectorOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div> {/* This closes the main modal content div */}
        </div> // This closes the modal backdrop div
      )}
    </div>
  );
};

export default HeroImageManagementSection;
