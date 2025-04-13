import React, { useState, DragEventHandler, MouseEventHandler, RefObject } from 'react';
import { UploadCloud, Link as LinkIcon } from 'lucide-react'; // Import icons

interface ImageUploadAreaProps {
  isDragging: boolean;
  error: string | null;
  previewUrl: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  handleDrop: DragEventHandler<HTMLDivElement>;
  handleDragOver: DragEventHandler<HTMLDivElement>;
  handleDragLeave: DragEventHandler<HTMLDivElement>;
  triggerFileInput: MouseEventHandler<HTMLButtonElement>;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
  handleUrlUpload: (url: string) => void;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  isDragging,
  error,
  previewUrl,
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  triggerFileInput,
  handleInputChange,
  handleUrlUpload,
}) => {
  const [imageUrl, setImageUrl] = useState(''); // State for the URL input

  const handleUrlButtonClick = () => {
    if (imageUrl.trim()) {
      handleUrlUpload(imageUrl.trim());
      setImageUrl(''); // Clear input after triggering upload
    }
  };

  return (
    <div
      // Use rounded-md for softer corners, adjust padding slightly
      className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 text-center transition-all duration-300 border ${isDragging ? 'border-blue-500 dark:border-blue-400 border-2 ring-2 ring-blue-200 dark:ring-blue-700' : 'border-gray-200 dark:border-gray-700'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Slightly bolder title */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Upload Image</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Supports JPG, PNG, GIF, WEBP</p>

      {/* Drop Zone Area - Enhanced Styling & Clickable */}
      <div
        className={`relative bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed rounded-md p-6 mb-6 transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer ${error ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30' : isDragging ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/40 border-solid ring-2 ring-blue-300 dark:ring-blue-600' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        onClick={() => fileInputRef.current?.click()} // Trigger file input on click
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Image preview"
            className="max-h-36 max-w-full object-contain rounded-md shadow-sm" // Added rounded-md and shadow
          />
        ) : (
          <>
            {/* Use Lucide icon */}
            <UploadCloud className={`h-12 w-12 mb-3 transition-colors ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isDragging ? 'Drop image here' : <>Drag & drop or <span className="text-indigo-600 dark:text-indigo-400 font-semibold">click to upload</span></>}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max file size: 10MB</p>
          </>
        )}
      </div>

      {/* REMOVED Separator text and Choose File button */}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp" // Be more specific
        onChange={handleInputChange}
        className="hidden"
        aria-label="File input"
      />

      {/* Error Message */}
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-4 font-medium">{error}</p>}

      {/* URL Input Section - Improved Layout */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <label htmlFor="imageUrlInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paste Image URL
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              id="imageUrlInput"
              type="url" // Use type="url" for better semantics/validation
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-600'}`}
              aria-label="Image URL input"
            />
          </div>
          <button
            onClick={handleUrlButtonClick}
            disabled={!imageUrl.trim()}
            className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
