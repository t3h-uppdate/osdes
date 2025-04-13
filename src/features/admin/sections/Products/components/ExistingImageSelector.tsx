import React, { useState, useMemo } from 'react';
import { useImageHistory } from '../../ImageManagement/hooks/useImageHistory'; // Adjust path
import { FileObject } from '@supabase/storage-js'; // Import correct type
import LoadingSpinner from '../../../../../components/common/LoadingSpinner'; // Adjust path
import IconRenderer from '../../../../../components/common/IconRenderer'; // Adjust path
import { ProductImage } from '../../../../../types/productTypes'; // Adjust path

interface ExistingImageSelectorProps {
  onSelectImages: (selectedImages: ProductImage[]) => void; // Callback with selected image objects
  onClose: () => void; // Callback to close the selector
  currentSelectedImages: ProductImage[]; // Pass the full ProductImage objects
}

const ExistingImageSelector: React.FC<ExistingImageSelectorProps> = ({
  onSelectImages,
  onClose,
  currentSelectedImages,
}) => {
  // Destructure getPublicUrl from the hook
  const { fileHistory, historyLoading, historyError, getPublicUrl } = useImageHistory({});

  // Store selected file *paths* (e.g., 'public/image.jpg') in the modal state
  // Initialize based on the URLs from currentSelectedImages
  const initialSelectedPaths = useMemo(() => {
      const pathSet = new Set<string>();
      const historyFileMap = new Map(fileHistory.map(f => [getPublicUrl(`public/${f.name}`), `public/${f.name}`]));
      currentSelectedImages.forEach(img => {
          const path = historyFileMap.get(img.url);
          if (path) {
              pathSet.add(path);
          }
      });
      return pathSet;
  }, [currentSelectedImages, fileHistory, getPublicUrl]); // Recalculate if inputs change

  const [selectedPathsInModal, setSelectedPathsInModal] = useState<Set<string>>(initialSelectedPaths);

   // Update selection if initial paths change (e.g., history loads after modal opens)
   React.useEffect(() => {
       setSelectedPathsInModal(initialSelectedPaths);
   }, [initialSelectedPaths]);


  const handleToggleSelection = (file: FileObject) => {
    const filePath = `public/${file.name}`; // Construct the path assuming 'public' folder
    setSelectedPathsInModal((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    // Convert selected paths back to ProductImage objects
    const selectedImages: ProductImage[] = Array.from(selectedPathsInModal).map(path => {
        const url = getPublicUrl(path);
        const fileName = path.split('/').pop() || 'Product image'; // Extract filename for alt text
        return { url: url || '', alt: fileName }; // Ensure URL is not null
    }).filter(img => img.url); // Filter out any potentially failed URL generations

    onSelectImages(selectedImages);
    onClose();
  };

  return (
    // Basic Modal Structure (Consider using a dedicated Modal component if available)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Product Images</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <IconRenderer iconName="X" size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {historyLoading && (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size={32} /> <span className="ml-3">Loading images...</span>
            </div>
          )}
          {historyError && (
            <p className="text-red-600 dark:text-red-400 text-center">Error loading images: {historyError}</p>
          )}
          {!historyLoading && !historyError && fileHistory.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No images found in history. Please upload images via the 'Upload' tab first.
            </p>
          )}
          {!historyLoading && !historyError && fileHistory.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {fileHistory.map((file) => {
                const filePath = `public/${file.name}`;
                const publicUrl = getPublicUrl(filePath);
                const isSelected = selectedPathsInModal.has(filePath);

                if (!publicUrl) return null; // Don't render if URL can't be generated

                return (
                  <div
                    key={file.id} // Use Supabase FileObject id
                    onClick={() => handleToggleSelection(file)}
                    className={`relative group aspect-square border-2 rounded-md cursor-pointer transition-all
                                  ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}
                  >
                    <img
                      src={publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-sm" // Slightly smaller radius to show border
                    />
                    {isSelected && (
                       <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <IconRenderer iconName="CheckCircle" size={24} className="text-white" />
                       </div>
                    )}
                     <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.name}
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t dark:border-gray-700 space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSelection}
            disabled={selectedPathsInModal.size === 0 && currentSelectedImages.length === 0} // Disable if nothing is selected and nothing was previously selected
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection ({selectedPathsInModal.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExistingImageSelector;
