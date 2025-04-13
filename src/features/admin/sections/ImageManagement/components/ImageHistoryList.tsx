import React from 'react';
import { FileObject, HistoryCopyStatus } from '../types/imageUploaderTypes'; // Assuming types are exported correctly
import { Loader, AlertTriangle, ImageOff, Copy as CopyIcon, Edit3, Trash2, Check, X, CheckSquare, Square, UploadCloud } from 'lucide-react'; // Import icons

interface ImageHistoryListProps {
  fileHistory: FileObject[];
  historyLoading: boolean;
  historyError: string | null;
  selectedHistoryFiles: string[];
  editingFileId: string | null; // Full path like 'public/name.jpg'
  newName: string;
  renameError: string | null;
  historyCopyStatus: HistoryCopyStatus | null;
  getPublicUrl: (filePath: string) => string | null;
  handleHistorySelectionChange: (filePath: string, isSelected: boolean) => void;
  handleUseSelected: () => void;
  handleDeleteSelected: () => void;
  handleCopyHistoryLink: (filePath: string) => void;
  handleEditClick: (fileId: string, currentName: string) => void; // fileId is full path
  handleCancelEdit: () => void;
  handleSaveRename: (oldFilePath: string) => void;
  handleDeleteFile: (filePath: string) => void;
  setNewName: (name: string) => void;
}

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ImageHistoryList: React.FC<ImageHistoryListProps> = ({
  fileHistory,
  historyLoading,
  historyError,
  selectedHistoryFiles,
  editingFileId,
  newName,
  renameError,
  historyCopyStatus,
  getPublicUrl,
  handleHistorySelectionChange,
  handleUseSelected,
  handleDeleteSelected,
  handleCopyHistoryLink,
  handleEditClick,
  handleCancelEdit,
  handleSaveRename,
  handleDeleteFile,
  setNewName,
}) => {

  // Improved Loading State
  if (historyLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
        <Loader className="animate-spin h-5 w-5 mr-2" />
        <span>Loading history...</span>
      </div>
    );
  }

  // Improved Error State
  if (historyError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-md text-center flex items-center justify-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-red-700 dark:text-red-200 font-medium">Error loading history</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">{historyError}</p>
        </div>
      </div>
    );
  }

  const getFilePath = (file: FileObject): string => `public/${file.name}`;

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Image History</h3>

      {/* Bulk Actions - Improved Styling */}
      {selectedHistoryFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between border border-gray-200 dark:border-gray-600 shadow-sm">
           <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedHistoryFiles.length} file(s) selected</span>
           <div className="flex items-center space-x-2">
             <button
                onClick={handleUseSelected}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700 flex items-center space-x-1"
                title="Use selected image URL(s)"
             >
                <UploadCloud size={14} />
                <span>Use</span>
             </button>
             <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700 flex items-center space-x-1"
                title="Delete selected files"
             >
                <Trash2 size={14} />
                <span>Delete</span>
             </button>
           </div>
        </div>
      )}

      {/* Empty State */}
      {fileHistory.length === 0 && !historyLoading && !historyError ? (
         <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
            <ImageOff className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No images uploaded yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Upload an image to see it here.</p>
         </div>
      ) : (
        // Grid Container
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-1 -m-1">
          {fileHistory.map((file) => {
            const filePath = getFilePath(file);
            const publicUrl = getPublicUrl(filePath);
            const isSelected = selectedHistoryFiles.includes(filePath);
            const isEditing = editingFileId === filePath;
            const copyStatus = historyCopyStatus?.fileId === filePath ? historyCopyStatus.message : 'Copy Link';
            const CheckboxIcon = isSelected ? CheckSquare : Square;

            return (
              // Grid Item Card - Improved Styling
              <div key={filePath} className={`relative group bg-white dark:bg-gray-700/60 rounded-md shadow-sm border transition-all duration-200 flex flex-col overflow-hidden cursor-pointer ${isSelected ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-700/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'}`}
                   onClick={() => handleHistorySelectionChange(filePath, !isSelected)} // Click card to toggle selection
              >
                 {/* Checkbox Icon - More integrated look */}
                 <CheckboxIcon
                    className={`absolute top-1.5 left-1.5 z-10 h-5 w-5 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`}
                    aria-hidden="true" // Hide decorative icon from screen readers
                 />
                 {/* Hidden actual checkbox for accessibility */}
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent card click handler
                      handleHistorySelectionChange(filePath, e.target.checked);
                    }}
                    className="absolute top-1.5 left-1.5 h-5 w-5 opacity-0 cursor-pointer z-20" // Make it clickable but invisible
                    aria-label={`Select ${file.name}`}
                 />

                 {/* Image Preview Area */}
                 <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-600 flex items-center justify-center overflow-hidden rounded-t-md">
                   {publicUrl ? (
                      <img src={publicUrl} alt={file.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                   ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center text-gray-400 dark:text-gray-300">
                        <ImageOff className="h-8 w-8" />
                      </div>
                   )}
                 </div>

                 {/* Content Area */}
                 <div className="p-2.5 flex flex-col flex-grow text-xs">
                   {isEditing ? (
                     // Editing State - Improved Styling
                     <div className="flex flex-col space-y-1.5 flex-grow">
                       <input
                         type="text"
                         value={newName}
                         onChange={(e) => setNewName(e.target.value)}
                         className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-500 rounded-md w-full focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                         aria-label="New file name"
                         onClick={(e) => e.stopPropagation()} // Prevent card click
                         autoFocus
                       />
                       {renameError && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{renameError}</p>}
                       <div className="flex justify-end space-x-1.5 mt-auto pt-1">
                         <button onClick={(e) => { e.stopPropagation(); handleSaveRename(filePath); }} className="p-1 rounded-md text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50" title="Save">
                           <Check size={16} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="p-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50" title="Cancel">
                           <X size={16} />
                         </button>
                       </div>
                     </div>
                   ) : (
                     // Normal State - Improved Styling
                     <>
                       <p className="font-medium text-gray-800 dark:text-gray-100 truncate mb-0.5" title={file.name}>{file.name}</p>
                       <p className="text-gray-500 dark:text-gray-400 mb-1.5">
                         {formatBytes(file.metadata?.size ?? 0)} - {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                       </p>
                       {/* Action Buttons - Improved Styling */}
                       <div className="mt-auto pt-1 flex items-center justify-between space-x-1.5">
                         <button
                           onClick={(e) => { e.stopPropagation(); handleCopyHistoryLink(filePath); }}
                           className={`px-2 py-1 rounded-md transition-colors flex-grow text-center text-xs font-medium flex items-center justify-center space-x-1 ${copyStatus === 'Copied!' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : copyStatus === 'Failed!' || copyStatus === 'Error!' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}
                           disabled={copyStatus !== 'Copy Link'}
                           title="Copy image URL"
                         >
                           <CopyIcon size={12} />
                           <span>{copyStatus === 'Copy Link' ? 'Copy' : copyStatus}</span>
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleEditClick(filePath, file.name); }}
                           className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
                           title="Rename file"
                         >
                           <Edit3 size={14} />
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleDeleteFile(filePath); }}
                           className="p-1 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300"
                           title="Delete file"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     </>
                   )}
                 </div>
              </div> // End Grid Item Card
            ); // End return
          })} {/* End map */}
        </div> // End Grid container
      )}
    </div> // End main container
  );
}; // End component
