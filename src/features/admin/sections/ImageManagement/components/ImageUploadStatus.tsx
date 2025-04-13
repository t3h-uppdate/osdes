import React from 'react';
import { UploadStatus } from '../types/imageUploaderTypes';
import { CheckCircle, AlertCircle, Loader2, Copy, UploadCloud } from 'lucide-react'; // Import icons

interface ImageUploadStatusProps {
  status: UploadStatus;
  previewUrl: string | null;
  uploadedUrl: string | null;
  error: string | null;
  copyButtonText: string;
  handleCopyLink: () => void;
  resetState: () => void; // Function to go back to the idle state
}

export const ImageUploadStatus: React.FC<ImageUploadStatusProps> = ({
  status,
  previewUrl,
  uploadedUrl,
  error,
  copyButtonText,
  handleCopyLink,
  resetState,
}) => {
  // Consistent container style
  const containerClasses = "w-full max-w-md bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700";

  const renderProcessingState = (message: string) => (
    <div className={`${containerClasses} relative`}>
      {previewUrl && (
        <div className="mb-4 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 opacity-40">
          <img src={previewUrl} alt="Processing preview" className="max-w-full max-h-48 object-contain mx-auto" />
        </div>
      )}
      {/* Overlay for spinner - improved centering */}
      <div className={`flex flex-col items-center justify-center ${previewUrl ? 'absolute inset-0 bg-white/70 dark:bg-gray-800/70 rounded-md' : 'py-10'}`}>
        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" />
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">{message}</h2>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className={containerClasses}>
      <CheckCircle className="mx-auto h-12 w-12 text-green-500 dark:text-green-400 mb-3" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Upload Successful</h2>
      {previewUrl && (
        <div className="mb-6 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
          <img src={previewUrl} alt="Uploaded preview" className="max-w-full max-h-64 object-contain mx-auto" />
        </div>
      )}
      {/* Improved URL display and copy button */}
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700/50 mb-5 text-left">
        <span className="flex-grow text-sm text-gray-700 dark:text-gray-200 p-1 truncate">
          {uploadedUrl ?? 'No URL available'}
        </span>
        <button
          onClick={handleCopyLink}
          className="ml-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center space-x-1"
          aria-label="Copy image link"
        >
          <Copy size={14} />
          <span>{copyButtonText}</span>
        </button>
      </div>
      {/* Consistent button style */}
      <button
        onClick={resetState}
        className="w-full sm:w-auto px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm"
      >
        Upload Another
      </button>
    </div>
  );

  const renderErrorState = () => (
    <div className={containerClasses}>
      <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-3" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Upload Failed</h2>
      <p className="text-red-600 dark:text-red-400 text-sm mb-6">{error || 'An unknown error occurred.'}</p>
      {previewUrl && (
        <div className="mb-6 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 opacity-60">
          <img src={previewUrl} alt="Upload failed preview" className="max-w-full max-h-48 object-contain mx-auto" />
        </div>
      )}
      {/* Consistent button style */}
      <button
        onClick={resetState}
        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm"
      >
        Try Again
      </button>
    </div>
  );

  switch (status) {
    case 'fetching_url':
        return renderProcessingState('Fetching image from URL...');
    case 'uploading':
      return renderProcessingState('Uploading...');
    case 'success':
      return renderSuccessState();
    case 'error':
      return renderErrorState();
    default: // Should not happen if used correctly, but good practice
      return null;
  }
};
